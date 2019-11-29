// pages/userpage/userpage_real/userpage_real.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

let temp_subscribe_obj = {}

Page({

  data: {
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    user_data: null,
    current: 0,
    barUnderlineAniData: {},
    img_data: null,
    coll_data: null,
    img_height_list: [],
    img_width_list: [],
    show_img_group: [],
    img_height_list_length: null,
    subscribe_obj: null,
    cry_id: null,
    coverImgTempURL: null
  },

  onLoad: function (options) {
    let self = this, d = self.data
    self.setData({ cry_id: app.globalData.cry_id})
    console.log(d.cry_id)
    let temp_user_data = app.globalData.userpage_data
    self.init_user_info(temp_user_data.uid);
    self.initSubscribe()
    if (temp_user_data.cover_img.indexOf('https') == -1){
      wx.cloud.getTempFileURL({
        fileList: [temp_user_data.cover_img],
        success: res => {
          // console.log(res.fileList)
          // temp_user_data.cover_img = res.fileList[0].tempFileURL
          self.setData({ coverImgTempURL: res.fileList[0].tempFileURL})
        },
        fail: console.error
      })
      self.setData({ user_data: temp_user_data })
    }
    else{
      self.setData({ coverImgTempURL: temp_user_data.cover_img })
    }
    // console.log(d.user_data)
  },

  onReady(){
    const barUnderlineAni = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })

    this.barUnderlineAni = barUnderlineAni
  },

  do_poll: function () {
    let self = this;
    let img_list = self.data.img_data
    let img_width = self.data.system.screenWidth * 0.49
    let temp_h = [0, 0], temp_w = [0, 1];
    let height_list = []
    let real_height, i, min_height, index, current_height;
    for (i = 0; i < img_list.length; i++) {
      if (i < 2) {
        real_height = img_list[i].height / img_list[i].width * img_width
        height_list.push(real_height)
      } else {
        if (height_list[0] < height_list[1]) {
          min_height = height_list[0]
          index = 0;
        } else {
          min_height = height_list[1]
          index = 1;
        }
        current_height = img_list[i].height / img_list[i].width * img_width
        temp_h.push(min_height)
        temp_w.push(index)
        height_list[index] += current_height
      }
    }
    self.setData({
      img_height_list: temp_h,
      img_width_list: temp_w,
      img_height_list_length: temp_h.length
    })
    console.log(self.data.img_height_list, self.data.img_width_list)
  },

  showImg_2(tempDataList) {
    // 图片懒加载
    let self = this
    for (let i in tempDataList) {
      wx.createIntersectionObserver().relativeToViewport().observe(`.item-${i}`, (res) => {
        if (res.intersectionRatio > 0) {
          let index = `show_img_group[${i}]`
          self.setData({ [index]: 1 })
        }
      })
    }
  },

  init_user_info(uid) {
    let self = this, d = self.data;
    wx.request({
      url: `${urls.get_info_user}?uid=${uid}`,
      success(res) {
        console.log(res)
        if(res.data.imgs.length != 0){
          let temp_img_id_list = []
          res.data.imgs.forEach((item) => {
            temp_img_id_list.push(item.iid)
          })
          wx.cloud.getTempFileURL({
            fileList: temp_img_id_list,
            success: cloud_res => {
              cloud_res.fileList.forEach((item, index) => {
                res.data.imgs[index].tempFileURL = item.tempFileURL
              })
              self.setData({
                img_data: res.data.imgs,
              })
              self.do_poll()
              self.showImg_2(res.data.imgs)
            },
            fail: console.error
          })
        }
        

        if (res.data.colls.length != 0) {
          console.log(res.data.colls)
          // 获取影集中预览图片中的cloud_id
          let temp_coll_id_list = [];
          let temp_coll_index_list = [];
          res.data.colls.forEach((item, index) => {
            if (item.priview_photo.indexOf('lengying') != -1) {
              // 如果是云存储的内容
              temp_coll_id_list.push(item.priview_photo.split('_').join('.'))
              temp_coll_index_list.push(index)
            }
          })
          console.log(temp_coll_id_list)

          wx.cloud.getTempFileURL({
            fileList: temp_coll_id_list,
            success: cloudRes => {
              console.log(cloudRes)
              cloudRes.fileList.forEach((item, index) => {
                res.data.colls[temp_coll_index_list[index]].priview_photo = item.tempFileURL
              })
              self.setData({ coll_data: res.data.colls.length != 0 ? res.data.colls : null })
            },
            fail: console.error
          })
        }
        
        self.setData({ user_data: res.data.user})
      }
    })
  },


  back_navg: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  swiperChange(e){
    // console.log(e)
    let d = this.data
    e.detail.current == 1 ?
      this.barUnderlineAni.translateX(d.system.windowWidth * 0.5).step()
    : 
      this.barUnderlineAni.translateX(0).step()
    this.setData({ current: e.detail.current, barUnderlineAniData: this.barUnderlineAni.export() })

  },

  tapChange(e){
    let d = this.data
    e.currentTarget.dataset.current == '1' ?
      this.barUnderlineAni.translateX(d.system.windowWidth * 0.5).step()
      :
      this.barUnderlineAni.translateX(0).step()
    this.setData({ 
        current: e.currentTarget.dataset.current,
        barUnderlineAniData: this.barUnderlineAni.export() 
     })

  },

  init_sub_method() {
    let self = this, d = self.data;
    wx.request({
      url: `${urls.subscribe}?uid=${app.globalData.cry_id}`,
      success(res) {
        // console.log('init sub')
        // console.log(res.data)
        self.setData({ subscribe_obj: res.data })
        wx.setStorage({
          key: 'subscribe',
          data: res.data,
        })
        self.update_sub_num(res.data)
      }
    })
  },

  initSubscribe() {
    // 初始化关注列表
    let self = this, d = self.data;
    let timeOut = null;
    wx.getStorage({
      key: 'subscribe',
      success: function (res) {
        // console.log(res.data)
        self.setData({ subscribe_obj: res.data })
        self.update_sub_num(res.data)
        // console.log(d.subscribe_obj)
      },
      fail(e) {
        // 缓存中没有数据，则请求服务器
        if (app.globalData.cry_id === null) {
          wx.cloud.callFunction({
            name: 'login',
            success(res) {
              app.globalData.cry_id = md5(res.result.openid)
              self.init_sub_method()
            }
          })
        } else {
          self.init_sub_method()
        }
      }
    })
  },

  update_sub_num(sub_obj) {
    let sub_list = Object.values(sub_obj)
    let num = 0;
    sub_list.forEach((item) => {
      if (item == 1) num++;
    })
    app.globalData.sub_num = num
  },

  doSubscribe(e) {
    let self = this, d = self.data;
    let user = e.currentTarget.dataset.user
    console.log(user)
    let uid = user.uid ? user.uid : user.id
    temp_subscribe_obj = d.subscribe_obj
    if (temp_subscribe_obj[uid]) {
      // 如果已关注，则取消关注
      temp_subscribe_obj[uid] = 0;
      self.update_subscribe_user(0, user)
    } else {
      // 未关注，则关注
      temp_subscribe_obj[uid] = 1;
      self.update_subscribe_user(1, user)
      wx.showToast({
        title: '关注成功',
        icon: 'none',
        duration: 1000
      })
    }
    self.setData({ subscribe_obj: temp_subscribe_obj })
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
      success(res) {
        console.log(res)
      }
    })
    self.update_sub_num(d.subscribe_obj)
  },

  update_subscribe_user(type, user) {
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

    let changeFansNum = 'user_data.followers_count'
    type == '0' ? 
      self.setData({ 
        [changeFansNum]: (d.user_data.followers_count - 1 <= 0 ? 0 : d.user_data.followers_count - 1)
      })
    :
      self.setData({ [changeFansNum]: d.user_data.followers_count + 1 }) 
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

  go_detailColl(e){
    console.log(e.currentTarget.dataset.item)
    app.globalData.temp_coll_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../../search/detail_coll/detail_coll`,
    })

  },

  go_talk(e) { 
    app.globalData.talkToUserInfo = e.currentTarget.dataset.user
    console.log(app.globalData.talkToUserInfo)
    wx.navigateTo({
      url: `../../message/talk/talk?target_id=${app.globalData.talkToUserInfo.uid}&is_read=1`,
    })
  },

  lookFans() {
    let d = this.data
    wx.navigateTo({
      url: `../../me/fans/fans?uid=${d.user_data.uid}&title=${"他的粉丝"}`
    })
  },

  lookSub() {
    let d = this.data
    wx.navigateTo({
      url: `../../me/follow/follow?uid=${d.user_data.uid}&title=${"他的关注"}`
    })
   },

  lookLike(){
    let d = this.data
    wx.navigateTo({
      url: `../../me/like/like?uid=${d.user_data.uid}&title=${"他喜欢的"}`
    })
  },

  goEdit(){
    wx.navigateTo({
      url: '../../me/editInfo/editInfo',
    })
  },

  previewImg: function (e) {
    let self = this;
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../../preview/preview`
    })
  },
})