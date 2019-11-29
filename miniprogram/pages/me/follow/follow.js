// pages/me/follow/follow.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

const per_page = 15
let lock = 0
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '我的关注', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    data_list: null,
    page: 0,
    temp_subscribe: {},
    uid: null,
    cry_id: null
  }, 

 onLoad(options){
   let self = this, d = self.data;
   let navbarTitle = 'nvabarData.title'
   console.log(options.uid)
   this.setData({
     [navbarTitle]: options.title,
     uid: options.uid,
     cry_id: app.globalData.cry_id
   })
   self.init_sub_data()
 },

 onShow(){
   let self = this
   self.setData({
     temp_subscribe: wx.getStorageSync('subscribe'),
   })
 },

 onReachBottom(){
   let self = this, d = self.data
   wx.showLoading({
     title: '加载中',
   })
   if(!lock){
     let tempData = d.data_list
    lock = 1
    wx.request({
      url: `${urls.subscribe_userinfo}?uid=${d.uid}&page=${self.data.page}&per_page=${per_page}`,
      success(res) {
        if (res.data.length) {
          self.setData({
            data_list: tempData.concat(res.data),
            page: self.data.page + 1
          })
        }
        else{
          wx.showToast({
            title: '加载完毕',
            icon: 'none'
          })
        }
        wx.hideLoading()
        lock = 0
      }
    })   
   }
 },

 init_sub_data(){
  let self = this, d = self.data
  wx.request({
    url: `${urls.subscribe_userinfo}?uid=${d.uid}&page=${self.data.page}&per_page=${per_page}`,
    success(res){
      console.log('init sub data')
      console.log(res)
      if(res.data.length){
        self.setData({
          temp_subscribe: wx.getStorageSync('subscribe'),
          data_list: res.data,
          page: self.data.page + 1
        })
      }
      console.log(d.data_list)
    }
  })   
 },

  subFunc(e){
    let self = this, d = self.data;
    let{id, type, index}  = e.currentTarget.dataset
    let temp_obj = {}
    temp_obj = d.temp_subscribe

    temp_obj[id] = parseInt(type)
    self.setData({ temp_subscribe: temp_obj})
    app.globalData.sub_num = type == '1' ? app.globalData.sub_num + 1 : app.globalData.sub_num - 1
    
    // 更新缓存
    wx.setStorage({
      key: 'subscribe',
      data: d.temp_subscribe,
    })
    wx.request({
      url: `${urls.subscribe}`,
      method: 'POST',
      data: {
        uid: app.globalData.cry_id,
        data: JSON.stringify(d.temp_subscribe)
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res) {
        console.log(res)
      }
    })
    self.update_subscribe_user(type, d.data_list[index])
    
  },

  update_subscribe_user(type, user) {
    let self = this, d = self.data;
    console.log(user)
    // type = 0 取消关注，删除数据库中的关注用户
    // type = 1  添加关注，添加数据库中的关注用户
    let uid = app.globalData.cry_id,
      tid = user.uid,
      userinfo = {
        uid: user.uid,
        username: user.username,
        avater: user.avater,
        total_photos: user.total_photos,
      }
    let data = {
      type: type,
      uid: uid,
      tid: tid,
      userinfo: JSON.stringify(userinfo),
      sub_userinfo: JSON.stringify(app.globalData.lengying_userinfo)
    }
    console.log(data)
    self.sub_user_method(data)
  },

  sub_user_method(data) {
    wx.request({
      url: `${urls.subscribe_userinfo}`,
      method: 'POST',
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res) {
        console.log(res)
      }
    })
  },

  go_userpage(e){
    app.globalData.userpage_data = e.currentTarget.dataset.user
    if (e.currentTarget.dataset.user.avater.indexOf('wx.qlogo.cn') != -1){
      wx.navigateTo({
        url: `../../userpage/userpage_real/userpage_real`,
      })
    }
    else{
      wx.navigateTo({
        url: `../../userpage/userpage`,
      })
    }
  }
})