const app = getApp();
const urls = require('../../utils/config.js').urls
import md5 from "../../utils/md5.js"
    
let temp_like_obj = {}, is_bottom = 1, page = 1;
let touch_start, touch_end; 
let temp_data = [], temp_all_urls = [], temp_file_list = [];
let last_update_time, temp_item, temp_subscribe_obj;
let load_img_list = []

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '棱影', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.system.statusBarHeight,
    data_list: [],
    system: app.globalData.system,
    userInfo: app.globalData.userInfo,
    like_obj: {},
    comment_obj:{},
    refresh_height: app.globalData.nav_bar_height - app.globalData.system.statusBarHeight,
    actionSheetHidden: true,
    subscribe_obj: {},
    timer: null,
    show_img_group: [],
    load_img_group: [],
    cry_id: null
  },

  imgLoadDone(e){
    let index = e.currentTarget.dataset.index
    let load_ = `load_img_group[${index}]`
    this.setData({
      [load_]: 1 
    })
  },

  onLoad(options) {
    console.log(options)
    let self = this;
    wx.showLoading({
      title: '加载数据',
    })

    wx.request({
      url: urls.get_img + "page=" + page + "&per_page=12",
      success: res=>{
        self.judgeImgFrom(res.data)
      }
    })
    self.initSubscribe() // 初始化关注列表
    self.init_comment_data() // 初始化评论列表
    self.init_like_obj() // 初始化点赞列表
    if (app.globalData.cry_id)
      self.setData({ cry_id: app.globalData.cry_id })
    else{
        wx.cloud.callFunction({
          name: 'login',
          success(res) {
            self.setData({ cry_id: md5(res.result.openid) })
        }
      })
    }

    if (options._switch == '1') {
      let i;
      for (i = 0; i < app.globalData.notifyData.length; i++) {
        if (!app.globalData.notifyData[i].is_read) {
          wx.showTabBarRedDot({
            index: 3,
            success() {
            },
            fail(e) { console.log(e) }
          })
          break;
        }
      }
    }
  },

  onHide(){
    let self = this
    clearInterval(self.data.timer)
  },

  onShow(){
    let self = this
    if (self.data.data_list.length && !self.data.show_img_group.length){
      self.showImg_2(self.data.data_list)
    }
    self.setData({
      like_obj: wx.getStorageSync('like'),
      comment_obj: wx.getStorageSync('comment_length')
    })
    self.initSubscribe()
  },

  onReady() {
    // last_update_time = Date.now()
    const refreshAni = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    this.refreshAni = refreshAni;
  },

  judgeImgFrom(judgedData){
    let self = this, d = self.data
    temp_data = d.data_list

    if (judgedData[0].isPassed) {
      judgedData.forEach((item) => {
        temp_file_list.push(item.iid)
      })
      // 判断数据列表是否为用户数据
      wx.cloud.getTempFileURL({
        fileList: temp_file_list,
        success: result => {
          temp_all_urls = result.fileList
          temp_all_urls.forEach((item, index) => {
            judgedData[index].tempFileURL = item.tempFileURL
            temp_data.push(judgedData[index])
            temp_data[temp_data.length - 1].iid = temp_data[temp_data.length - 1].iid.split('.').join('_')
          })
          temp_file_list = []

          self.setData({
            data_list: temp_data,
          })
          temp_data = []

          // let ttime = Date.now()
          // console.log(ttime - last_update_time)
          // console.log(temp_data)
          wx.hideLoading()
          self.showImg_2(d.data_list)
        },
        fail: console.error
      })
    }
    else {
      judgedData.forEach((item)=>{
        temp_data.push(item)
      })
      self.setData({
        data_list: temp_data,
      })
      temp_data = []
 
      let ttime = Date.now()
      // console.log(ttime - last_update_time)
      wx.hideLoading()
      self.showImg_2(d.data_list)
    }
  },

  showImg_2(tempDataList){
    // 图片懒加载
    let self = this
    for (let i in tempDataList){
      wx.createIntersectionObserver().relativeToViewport().observe(`.item-${i}`, (res) =>{
        if (res.intersectionRatio > 0){
          let index = `show_img_group[${i}]`
          self.setData({ [index]: 1 })
        }
      })
    }
  },

  init_sub_method(){
    let self = this, d = self.data;
    wx.request({
      url: `${urls.subscribe}?uid=${app.globalData.cry_id}`,
      success(res) {
        console.log('init sub')
        console.log(res.data)
        self.setData({ subscribe_obj: res.data })
        // if(timeOut)
        //   clearTimeout(timeOut)
        wx.setStorage({
          key: 'subscribe',
          data: res.data,
        })
        self.update_sub_num(res.data)
      }
    })
  },

  initSubscribe(){
    // 初始化关注列表
    let self = this, d = self.data;
    wx.getStorage({
      key: 'subscribe',
      success: function(res) {
        // console.log('initSubscribe')
        // console.log(res.data)
        self.setData({ subscribe_obj: res.data })
        self.update_sub_num(res.data)
        // console.log(d.subscribe_obj)
      },
      fail(e){
        // 缓存中没有数据，则请求服务器
        if (app.globalData.cry_id === null){
          wx.cloud.callFunction({
            name: 'login',
            success(res) {
              app.globalData.cry_id = md5(res.result.openid)
              self.init_sub_method()
            }
          })
        }else{
          self.init_sub_method()
        }
      }
    })
  },

  update_sub_num(sub_obj){
    let sub_list = Object.values(sub_obj)
    let num = 0;
    if (sub_list.length)
      sub_list.forEach((item)=>{
        if (item == 1) num ++;
      })
    app.globalData.sub_num = num
  },

  doSubscribe(e){
    let self = this, d = self.data;
    let user = e.currentTarget.dataset.user
    let index = e.currentTarget.dataset.index
    console.log(user, index)
    let uid = user.uid ? user.uid : user.id
    temp_subscribe_obj = d.subscribe_obj
    if (temp_subscribe_obj[uid]){ 
      // 如果已关注，则取消关注
      temp_subscribe_obj[uid] = 0;
      self.update_subscribe_user(0, user)
    }else{
      // 未关注，则关注
      temp_subscribe_obj[uid] = 1;
      self.update_subscribe_user(1, user)
      wx.showToast({
        title: '关注成功',
        icon: 'none',
        duration: 1000
      })
    }
    self.setData({ subscribe_obj: temp_subscribe_obj})
    temp_subscribe_obj = {}
    console.log(d.subscribe_obj)
    // 更新缓存
    wx.setStorage({
      key: 'subscribe',
      data: d.subscribe_obj,
    })
    wx.request({
      url: `${urls.subscribe}`,
      method: 'POST',
      data: {
        uid: app.globalData.cry_id,
        data: JSON.stringify(d.subscribe_obj) 
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res){
        console.log(res)
      }
    })
    self.update_sub_num(d.subscribe_obj)
  },

  update_subscribe_user(type, user){
    let self = this, d = self.data;
    // type = 0 取消关注，删除数据库中的关注用户
    // type = 1  添加关注，添加数据库中的关注用户
    let uid = app.globalData.cry_id,
      tid = user.uid ? user.uid : user.id,
        userinfo = {
        uid: tid,
        username: user.username, 
        avater: user.uid ? user.avater : user.profile_image.medium,
        total_photos: user.total_photos,
      }
    let data = {
      type: type,
      uid: uid,
      tid: tid,
      userinfo: JSON.stringify(userinfo),
      sub_userinfo: JSON.stringify(app.globalData.lengying_userinfo)
    }
    self.sub_user_method(data)
  },

  sub_user_method(data){
    wx.request({
      url: `${urls.subscribe_userinfo}`,
      method: 'POST',
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res){
        console.log(res)
      }
    })
  },

  action_sheet(e) {
     console.log(e.currentTarget.dataset)
    temp_item = e.currentTarget.dataset.item
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  recoverAni(){
    let self = this
    this.refreshAni.translateY(0).step()
    self.setData({
      refreshAniData: this.refreshAni.export()
    })
  },

  refreshNewImg(){
    let self = this
    console.log(last_update_time)
    wx.request({
      url: `${urls.get_refresh}?time=${last_update_time}`,
      success(e){
        if(e.data)
          console.log(e.data)
        // let ctime = new Date()
        // last_update_time = ctime.getTime()
        self.recoverAni()
      }
    })
  },


  onReachBottom(){
    if (is_bottom) {
      is_bottom = 0;
      let self = this;
      page += 1;
      wx.request({
        url: urls.get_img + "page=" + page + "&per_page=12",
        success: function (res) {
          self.judgeImgFrom(res.data)
          is_bottom = 1;
        }
      })
    }
  },


  onTouchStart(e){
    // console.log(e)
    touch_start = e.changedTouches[0].clientY
  },

  onTouchEnd(e){
    let self = this, d = self.data;
    touch_end = e.changedTouches[0].clientY
    if ((touch_start - touch_end < -100) && (e.changedTouches[0].pageY < d.system.windowHeight)){
      this.refreshAni.translateY(d.refresh_height + 50)
      this.refreshAni.rotate(360).step()
      self.setData({
        refreshAniData: this.refreshAni.export()
      })

      self.refreshNewImg()
    }
  },

  init_comment_data: function(){
    let self = this;
    wx.request({
      url: `${urls.get_comment_length}`,
      success: function(res){
        // console.log(res.data)
        self.setData({ comment_obj: (res.data !== 'error') ? res.data : {}})
        wx.setStorage({
          key: 'comment_length',
          data: (res.data !== 'error') ? res.data : {},
        })
      }
    })
  },

  previewImg: function(e){
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    console.log(app.globalData.preview_img_data)
    wx.navigateTo({
      url: `../preview/preview`
    })
  },


  show_comment: function (e) {
    let self = this, d = self.data;
    console.log(e)
    wx.navigateTo({
      url: `../comment/comment?id=${e.currentTarget.dataset.id}`,
    })
  },


  like_func: function(e){
    let self = this, d = self.data;
    console.log(e)
    let imgItem = e.currentTarget.dataset.item
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    // let tid = imgItem.user.uid || "-1"
    let data = wx.getStorageSync('like')
    if(data){
      // 点过赞 则取消赞
      if (data[id]){
        temp_like_obj[id] = 0
      }else{
        temp_like_obj[id] = 1
        wx.showToast({
          title: '点赞成功',
        })
      }
      wx.setStorage({
        key: 'like',
        data: temp_like_obj
      })
      self.setData({like_obj: temp_like_obj})
    }
    else{
      temp_like_obj[id] = 1
      wx.setStorage({key: 'like', data: temp_like_obj})
    }
    let temp_obj = {}
    temp_obj[id] = temp_like_obj[id]
    console.log(temp_obj)
    self.post_like_back_server(temp_obj, id, imgItem)
  },

  post_like_back_server: function (temp_like_obj, id, imgItem){
    // console.log(app.globalData.cry_id, temp_like_obj)
    let likeTimeOut = setTimeout(function () {
      let self = this, d = self.data
      let newData = {
        id: app.globalData.cry_id,
        data: JSON.stringify(temp_like_obj),
        iid: id,
        imgItem: JSON.stringify(imgItem),
        // tid: tid
      }
      wx.request({
        url: urls.get_like,
        method: 'POST',
        data: newData,
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success: res => {
          console.log(res)
          clearTimeout(likeTimeOut)
        }
      })
    }, 2000)
  },

  init_like_obj: function(){
    let self = this, d = self.data;
    let value = wx.getStorageSync('like')
    if(value){
      temp_like_obj = value
      self.setData({ like_obj: temp_like_obj})
    }else{
      console.log(`${urls.get_like}?id=${app.globalData.cry_id}`)
      let initLikeTimeOut = setTimeout(()=>{
        wx.request({
          url: `${urls.get_like}?id=${app.globalData.cry_id}`,
          success: res => {
            console.log('init like')
            console.log(res)
            if (res.data == 'error') {
              temp_like_obj = {}
              self.setData({ like_obj: temp_like_obj })
            } else {
              temp_like_obj = res.data.data
              self.setData({ like_obj: temp_like_obj })
              wx.setStorage({
                key: 'like',
                data: temp_like_obj,
              })
            }
            clearTimeout(initLikeTimeOut)
          }
        })
      },1000)
    }
  },

  go_userpage: function(e){
    // if (e.currentTarget.dataset.item)
    app.globalData.userpage_data = e.currentTarget.dataset.item
    if(e.currentTarget.dataset.item.cover_img){
      wx.navigateTo({
        url: `../userpage/userpage_real/userpage_real`,
      })
    }
    else{
      wx.navigateTo({
        url: `../userpage/userpage`,
      })
    }
  },

  goReport(e){
    this.setData({ actionSheetHidden: true})
    wx.navigateTo({
      url: '../report/report?id=' + temp_item.id,
    })
  },

  goAddColl(e){
    this.setData({ actionSheetHidden: true })
    app.globalData.tempImgToColl = temp_item 
    wx.navigateTo({
      url: `../addToColl/addToColl`,
    })
  }
})