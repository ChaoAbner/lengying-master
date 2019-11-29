// pages/preview/preview.js
const app = getApp()
const urls = require('../../utils/config.js').urls

let temp_like_obj = {}, temp_avater, temp_username;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    touch: {
      distance: 0,
      scale: 1,
      baseWidth: null,
      baseHeight: null,
      scaleWidth: null,
      scaleHeight: null
    },
    height: null,
    item: {},
    system: app.globalData.system,
    img_url: null,
    avater_url: null,
    is_hide: !1,
    time: null,
    cry_id: null,
    animationData: {},
    topAniData: {},
    imgAniData: {},
    comAniData: {},
    info_show: !1,
    userInfo: null,
    like_obj: {},
    comment_ojb:{},
    id: null,
    comment_length: null,
    timer: null,
    actionSheetHidden: true,
  },

  onLoad: function(options){
    let self = this, d = self.data;
    wx.showLoading({
      title: '加载中',
    })
    self.init_like_obj() // 初始化点赞列表
    let preview_img_data = app.globalData.preview_img_data
    if (preview_img_data.tempFileURL)
      wx.getImageInfo({
        src: preview_img_data.tempFileURL,
        success(s) { console.log(s) },
        fail(e) { self.showModleFunc('错误', '该作品已被删除') }
      })
    if (preview_img_data.isPassed == false){
      self.showModleFunc('错误', '该作品在审核中')
    }
      
    else if (preview_img_data.iid && !preview_img_data.tempFileURL){
      self.showModleFunc('错误', '该作品已被删除')
    }

    else if (preview_img_data.isPassed){
      self.setData({
        height: app.globalData.nav_bar_height,
        item: preview_img_data,
        // system: app.globalData.system,
        cry_id: app.globalData.cry_id,
        time: preview_img_data.create_time.split('T')[0],
        userInfo: app.globalData.userInfo,
        id: preview_img_data.iid,
      })
    }
    else{
      self.setData({
        height: app.globalData.nav_bar_height,
        item: preview_img_data,
        // system: app.globalData.system,
        cry_id: app.globalData.cry_id,
        time: preview_img_data.created_at.split('T')[0],
        userInfo: app.globalData.userInfo,
        id: preview_img_data.id,
      })
      temp_avater = preview_img_data.user.profile_image.small.avater
      temp_username = preview_img_data.user.username
    }
    self.init_comment_length()
    
  },

  showModleFunc(title, content){
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success(res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },

  onReady(){
    const animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    const topAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    const imgAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    const comAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.topAni = topAni
    this.animation = animation
    this.imgAni = imgAni
    this.comAni = comAni
  },



  init_comment_length: function(){
    let self = this, d = self.data;
    console.log(d.id)
    wx.request({
      url: `${urls.get_perview_clength}?id=${d.id}`,
      success: function(res){
        self.setData({
          comment_length: res.data
        })
        wx.hideLoading()
      }
    })
  },

  go_userpage: function (e) {
    console.log(e)
    app.globalData.userpage_data = e.currentTarget.dataset.item
    if (e.currentTarget.dataset.item.cover_img){
      wx.navigateTo({
        url: `../userpage/userpage_real/userpage_real`,
      })
    }else{
      wx.navigateTo({
        url: `../userpage/userpage`,
      })
    }
   
  },


  back_page: function(){
    wx.navigateBack({
      delta: 1
    })
  },

  img_tap: function(e){
    console.log(e)
    let self = this, d = self.data;
    if (!d.info_show){
      self.setData({ is_hide: !d.is_hide })
    }
  },

  show_all: function(){
    let self = this, d = self.data;
    if (!d.info_show){
      this.animation.backgroundColor('#000')
      this.animation.opacity(1)
      this.animation.translateY(-150).step()
      this.imgAni.translateY(-200)
      this.imgAni.scale(1.5, 1.5).step()
      this.topAni.rotate(180).step()

      this.setData({
        animationData: this.animation.export(),
        topAniData: this.topAni.export(),
        imgAniData: this.imgAni.export(),
        info_show: !d.info_show
      })
    }else{
      this.animation.translateY(0).step()
      this.imgAni.translateY(0)
      this.imgAni.scale(1, 1).step()
      this.animation.opacity(0.8).step()
      this.topAni.rotate(0).step()

      this.setData({
        animationData: this.animation.export(),
        topAniData: this.topAni.export(),
        imgAniData: this.imgAni.export(),
        info_show: !d.info_show
      })
    }
  },

  like_func: function(e){
    let self = this, d = self.data;
    let id = d.id
    let data = temp_like_obj
    if (data) {
      // 点过赞 则取消赞
      if (data[id]) {
        temp_like_obj[id] = 0
      } else {
        temp_like_obj[id] = 1
        wx.showToast({
          title: '点赞成功',
        })
      }
      wx.setStorage({
        key: 'like',
        data: temp_like_obj
      })
      self.setData({ like_obj: temp_like_obj })
    } else {
      temp_like_obj[id] = 1
      wx.setStorage({ key: 'like', data: temp_like_obj })
    }
    let temp_obj = {}
    temp_obj[id] = temp_like_obj[id]
    console.log(temp_obj)
    self.post_like_back_server(temp_obj)
  },

  post_like_back_server: function (temp_like_obj) {
    console.log(app.globalData.cry_id, temp_like_obj)
    let self = this, d = self.data;
    setTimeout(function () {
      let newData = {
        id: app.globalData.cry_id,
        data: JSON.stringify(temp_like_obj),
        iid: d.id
      }
      wx.request({
        url: urls.get_like,
        method: 'POST',
        data: newData,
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success: res => {
          console.log(res)
        }
      })
    }, 2000)
  },

  init_like_obj: function () {
    let self = this, d = self.data;
    let value = wx.getStorageSync('like')
    if (value) {
      temp_like_obj = value
      self.setData({ like_obj: temp_like_obj })
    } else {
      wx.request({
        url: `${urls.get_like}?id=${app.globalData.cry_id}`,
        success: res => {
          console.log(res)
          if (res.data == 'error') {
            temp_like_obj = {}
            self.setData({ like_obj: temp_like_obj })
          } else {
            temp_like_obj = res.data
            self.setData({ like_obj: temp_like_obj })
          }
        }
      })
    }
  },

  show_comment: function (e) {
    let self = this, d = self.data
    wx.navigateTo({
      url: `../comment/comment?id=${d.id}`,
    })
  },
  hide_comment: function (e) {
    let self = this, d = self.data;
    this.comAni.translateX(-d.system.screenWidth).step()
    this.setData({
      comAniData: this.comAni.export()
    })
  },

  save: function (e) {
    var that = this;
    //获取相册授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              that.download_img(e);
            },
            fail() {//这里是用户拒绝授权后的回调
              wx.showModal({
                title: '警告',
                content: '您拒绝了授权，无法下载图片，点击确定重新授权',
                success: function (res) {
                  if (res.confirm){
                    wx.openSetting({
                      success(res){
                        if (res.authSetting["scope.writePhotosAlbum"]) {
                          that.download_img(e);
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {//用户已经授权过了
          that.download_img(e);
        }
      }
    })
  },


  download_img: function(e){
    wx.showToast({
      title: '已添加下载',
      icon: 'none'
    })
    this.setData({ actionSheetHidden: true})
    let id = e.currentTarget.dataset.url.split('/')[3].split('?')[0]
    wx.request({
      url: `${urls.download_url}?name=${app.globalData.userInfo.nickName}&id=${id}`,
      success: res=>{
        console.log(res.data)
        wx.downloadFile({
          url: res.data,
          success: res => {
            if (res.statusCode === 200) {
              wx.hideLoading()
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: res => {
                  wx.showToast({
                    title: '下载成功',
                  })
                }
              })
            }else{
              wx.hideLoading()
              wx.showToast({
                title: '下载失败',
              })
            }
          }
        })
      }
    })
  },

  touchstartCallback: function (e) {
    let self = this
    // 单手指缩放开始，也不做任何处理
    if (e.touches.length == 1) return
    console.log('双手指触发开始')
    // 注意touchstartCallback 真正代码的开始
    // 一开始我并没有这个回调函数，会出现缩小的时候有瞬间被放大过程的bug
    // 当两根手指放上去的时候，就将distance 初始化。
    let xMove = e.touches[1].clientX - e.touches[0].clientX;
    let yMove = e.touches[1].clientY - e.touches[0].clientY;
    let distance = Math.sqrt(xMove * xMove + yMove * yMove);
    self.setData({
      'touch.distance': distance,
    })
  },
  touchmoveCallback: function (e) {
    let self = this, d=  self.data;
    let touch = self.data.touch
    // 单手指缩放我们不做任何操作
    if (e.touches.length == 1) return
    console.log('双手指运动')
    let xMove = e.touches[1].clientX - e.touches[0].clientX;
    let yMove = e.touches[1].clientY - e.touches[0].clientY;
    // 新的 ditance
    let distance = Math.sqrt(xMove * xMove + yMove * yMove);
    let distanceDiff = distance - touch.distance;
    let newScale = touch.scale + 0.005 * distanceDiff
    // 为了防止缩放得太大，所以scale需要限制，同理最小值也是
    if (newScale >= 2) {
      newScale = 2
    }
    if (newScale <= 0.6) {
      newScale = 0.6
    }
    let scaleWidth = newScale * touch.baseWidth
    let scaleHeight = newScale * touch.baseHeight
    // 赋值 新的 => 旧的
    self.setData({
      'touch.distance': distance,
      'touch.scale': newScale,
      'touch.scaleWidth': scaleWidth,
      'touch.scaleHeight': scaleHeight,
      'touch.diff': distanceDiff
    })
    console.log(d.touch)
  },
  bindload: function (e) {
    let self = this, d = self.data;
    // bindload 这个api是<image>组件的api类似<img>的onload属性
    self.setData({
      'touch.baseWidth': e.detail.width,
      'touch.baseHeight': e.detail.height,
      'touch.scaleWidth': e.detail.width,
      'touch.scaleHeight': e.detail.height
    })
    console.log(d.touch)
  },


  action_sheet(e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  goAddColl(e) {
    this.setData({ actionSheetHidden: true })
    app.globalData.tempImgToColl = app.globalData.preview_img_data
    wx.navigateTo({
      url: `../addToColl/addToColl`,
    })
  },

  goReport(e) {
    this.setData({ actionSheetHidden: true })
    wx.navigateTo({
      url: '../report/report?id=' + app.globalData.preview_img_data.id,
    })
  },

})