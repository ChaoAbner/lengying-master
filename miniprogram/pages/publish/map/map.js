var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
const app = getApp()
let toLocationTimeout, temp_pos_data;
let qqmapsdk = new QQMapWX({
  key: 'PRABZ-3HZKW-FOGRU-ON5IA-DK55T-YABOB'
}); // 初始化api
Page({
  data:{
    posAniData:{},
    pos: {},
    system: app.globalData.system,
    height: app.globalData.system.statusBarHeight,
    header_height: app.globalData.nav_bar_height - app.globalData.system.statusBarHeight,
    address_data: null,
  },

  onLoad(e){
    let self = this, d = self.data
  },

  onReady(e) {
    let self = this
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap')
    toLocationTimeout = setTimeout(()=>{
      self.moveToLocation()
      self.initCenterLocation()
    },300)
    let posAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease'
    })
    this.posAni = posAni
  },

  onConfirm(e){
    let value = e.detail.value
    let self = this, d = self.data;
    console.log(`${d.pos.latitude}, ${d.pos.longitude}`, value)
    qqmapsdk.search({
      keyword: value,  //搜索关键词
      location: `${d.pos.latitude}, ${d.pos.longitude}`,  //设置周边搜索中心点
      success: res=>{
        console.log(res)
      },
      fail: res=>{
        console.log(res)
      }
    })
  },

  back_upload(){
    let self = this, d = self.data;
    let pages = getCurrentPages()
    let last_page = pages[pages.length - 2]
    last_page.setData({
      address: d.address_data.result.address_reference.landmark_l2.title
    })
    wx.navigateBack({
      delta: 1
    })
  },


  onTouchStart(e){
    console.log(e)
    this.posAni.scale(1.5).step()
    this.setData({posAniData: this.posAni.export()})
  },

  initCenterLocation() {
    let self = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        console.log(res)
        temp_pos_data = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        self.getCenterLocation(temp_pos_data)
      },
      fail(){
        wx.showModal({
          title: '警告',
          content: '您拒绝了授权，无法获取您的位置信息，点击确定重新授权',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  if (res.authSetting["scope.userLocation"]) {
                    self.initCenterLocation()
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  getCenterLocation(temp_pos_data){
    let self = this
    this.mapCtx.getCenterLocation({
      success(res) {
        qqmapsdk.reverseGeocoder({
          location: temp_pos_data,
          success: function (res) {
            console.log(res.result)
            self.setData({
              address_data: res,
              pos: temp_pos_data
            })
          },
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  moveToLocation() {
    let self = this, d = self.data
    this.mapCtx.moveToLocation({
      success(){
        clearTimeout(toLocationTimeout)
        self.initCenterLocation()
      }
    })
  },


  touchEnd(e){
    let self = this, d = self.data;
    console.log(e)
    this.mapCtx.getCenterLocation({
      success(res) {
        self.mapCtx.translateMarker({
          markerId: 0,
          autoRotate: true,
          duration: 1000,
          destination: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          animationEnd() {
            console.log('animation end')
          }
        })
        temp_pos_data = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        qqmapsdk.reverseGeocoder({
          location: temp_pos_data,
          success: function (res) {
            console.log(res.result.ad_info)
            self.setData({ 
              address_data: res ,
              pos: temp_pos_data
            })
          },
          fail: function (res) {
            console.log(res)
          }
        })

      }
    })

    this.posAni.scale(1).step()
    this.setData({ posAniData: this.posAni.export() })
  },

  back_page(){
    wx.navigateBack({
      delta: 1
    })
  },

  nearby_search(){
    var qqmapsdk = new QQMapWX({
      key: 'PRABZ-3HZKW-FOGRU-ON5IA-DK55T-YABOB'
    }); // 初始化api
  }
})