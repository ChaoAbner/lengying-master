// pages/comment/comment.js
const app = getApp()
const urls = require('../../utils/config.js').urls

let temp_list = [], commented_obj = {}

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '棱影', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.system.statusBarHeight,
    header_height: app.globalData.nav_bar_height - app.globalData.system.statusBarHeight,
    system: app.globalData.system,
    avater: null,
    comment_list: null,
    comment_list_length: 0,
    sid: null,
    input_value: null,
    comment_like_obj: {},
    comment_like_num: {},
    create_date: [],
    create_time: [],
    inputButtom: 0,
  },

  onLoad: function (options) {
    let self = this, d = self.data;
    console.log(options.id)
    self.init_comment_list(options.id) // 图片id
    self.init_comment_like()           // 更新评论点赞数据
    // self.init_comment_like_num()
  },

  like_func: function(e){
    let self = this, d = self.data;
    let inner_obj = {}, update_like_num, index = e.currentTarget.dataset.index
    let todo = 'comment_list['+index+'].fields.like_num'
    let pk = e.currentTarget.dataset.pk
    if (d.comment_like_obj[d.sid]){
      commented_obj[d.sid][pk] = d.comment_like_obj[d.sid][pk] ? 0 : 1
      update_like_num = d.comment_list[index].fields.like_num
      update_like_num = d.comment_like_obj[d.sid][pk] ? update_like_num + 1 : update_like_num - 1
    }else{
      inner_obj[pk] = 1
      commented_obj[d.sid] = inner_obj
      console.log('like num')
      console.log(d.comment_list[index].fields.like_num)
      update_like_num = d.comment_list[index].fields.like_num + 1
    }
    self.setData({
      comment_like_obj: commented_obj,
      [todo]: update_like_num
    })
    console.log('comment list')
    console.log(d.comment_list)
    wx.setStorage({
      key: 'comment_like',
      data: commented_obj,
    })
    let like_func_timeout = setTimeout(() => {
      console.log('update comment to server')
      let newData = {
        id: pk,
        uid: app.globalData.cry_id,
        data: JSON.stringify(wx.getStorageSync('comment_like')),
        sid: d.sid
      }
      wx.request({
        url: urls.update_comment_like,
        method: "POST",
        data: newData,
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success: res => {
          console.log(res)
          clearTimeout(like_func_timeout)
        }
      })
    }, 1000)
  },

  go_userpage(e){
    app.globalData.userpage_data = e.currentTarget.dataset.item.fields.user
    wx.navigateTo({
      url: '../userpage/userpage_real/userpage_real',
    })
  },

  init_comment_like: function(e){
    let self = this,d = self.data;
    commented_obj = wx.getStorageSync('comment_like')
    if(!commented_obj){
      console.log('no comment')
      wx.request({
        url: `${urls.get_comment}?id=${app.globalData.cry_id}`,
        success: res=>{
          console.log('success')
          console.log(res.data.data)
          if(res.data == 'error'){
            commented_obj = {}
          }else{
            commented_obj = res.data.data
          }
          self.setData({ comment_like_obj: commented_obj })
          wx.setStorage({
            key: 'comment_like',
            data: commented_obj,
          })
        }
      })
    }else{
      self.setData({ comment_like_obj: commented_obj })
    }
  },

  init_comment_list: function(sid){
    let self = this, d = self.data;
    let temp_create_date = []
    let temp_create_time = []
    wx.request({
      url: `${urls.get_comments}?id=${sid}`,
      success: res=>{
        console.log(res.data)
        
        if(res.data.length != 0){
          res.data.forEach((item) => {
            temp_create_date.push(item.fields.create_time.split('T')[0])
            temp_create_time.push(item.fields.create_time.split('T')[1].split('.')[0])
          })

          self.setData({
            comment_list: res.data,
            comment_list_length: res.data.length,
            create_date: temp_create_date,
            create_time: temp_create_time,
            sid: sid,
            avater: app.globalData.userInfo.avatarUrl
          })
        }else{
          self.setData({
            avater: app.globalData.userInfo.avatarUrl,
            comment_list: temp_list,
            comment_list_length: temp_list.length,
            sid: sid
          })
        }
      }
    })
  },

  init_comment_like_num: function(){
    let self = this, d = self.data
    wx.request({
      url: `${urls.back_comment_length}?id=${app.globalData.cry_id}`,
      success: res =>{
        console.log(res.data.data)
        wx.setStorage({
          key: 'comment_like',
          data: res.data.data,
        })
      }
    })
  },

  back_page: function(){
    wx.navigateBack({
      delta: 1
    })
  },

  onblur(e){
    let self = this
    self.setData({
      inputButtom: 0
    })
  },

  onfocus(e){
    let self = this
    self.setData({
      inputButtom: e.detail.height
    })
  },

  input_confirm: function(e){
    let self = this, d = self.data;
    self.setData({ input_value: ''})
    let data = {
      uid: app.globalData.cry_id, // 评论者id
      content: e.detail.value,    //  内容
      sid: d.sid,                 // 资源id
      avater: app.globalData.userInfo.avatarUrl,
      username: app.globalData.userInfo.nickName,
      type: 1,  
    }
    wx.request({
      url: `${urls.insert_comments}`,
      method: "POST",
      header: { 'Content-Type': 'application/x-www-form-urlencoded'},
      data:data,
      success: res=>{
        console.log(res.data)
        if(res.data != 'error'){
          self.onLoad({id: d.sid})
        }
      }
    })
    let temp_comment_length = wx.getStorageSync('comment_length') || {}
    console.log(d.sid)
    temp_comment_length[d.sid] = temp_comment_length[d.sid] ? (temp_comment_length[d.sid]) + 1 : 1
    console.log(temp_comment_length)
    wx.setStorage({
      key: 'comment_length',
      data: temp_comment_length,
    })
    
  },

})