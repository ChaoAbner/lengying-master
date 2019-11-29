//app.js
import md5 from 'utils/md5.js'
const urls = require('./utils/config.js').urls
const app = getApp()

App({
  onLaunch: function () {
    let self = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        self.globalData.authSetting = res.authSetting
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo)
              self.globalData.userInfo = res.userInfo
            },
            fail: res => {
              wx.redirectTo({
                url: '/pages/login/login',
              })
            }
          })
        } else {
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    }),

    wx.cloud.callFunction({
      name: 'login',
      success(res) {
        self.globalData.cry_id = md5(res.result.openid)
        // 获取用户信息和通知消息
        wx.request({
          url: `${urls.get_info_user}?uid=${self.globalData.cry_id}&n=1&u=1`,
          success(result){
            if(!result.data.error){
              // console.log('result')
              console.log(result)
              self.globalData.notifyData = result.data.notify
              self.globalData.lengying_userinfo = result.data.user
              let i;
              for (i = 0; i < result.data.notify.length; i++) {
                if (!result.data.notify[i].is_read) {
                  wx.showTabBarRedDot({
                    index: 3,
                    success() { console.log('有新的消息') }
                  })
                  break;
                }
              }
            }
            else{
              wx.redirectTo({
                url: '/pages/login/login',
              })
            }
          }
        })

        if (self.globalData.authSetting['scope.userLocation']){
          // 更新用户最近登录的经纬度
          self.updateGeo()
        }else{
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              console.log('location')
              self.globalData.authSetting['scope.userLocation'] = true
              // 更新用户最近登录的经纬度
              self.updateGeo()
            }
          })
        }
      }
    })


    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        self.globalData.system = res;
        //安卓系统导航高度为statusBarHeight+4
        self.globalData.nav_bar_height = res.statusBarHeight + 44
        if (res.system.indexOf("Android") != -1){
        //苹果系统导航高度为statusBarHeight+8
          self.globalData.system_type = 0   // 安卓
          self.globalData.nav_bar_height += 4 
        } else self.globalData.system_type = 1 // 苹果
        // console.log(self.globalData.nav_bar_height)
      }
    }),


      wx.getStorage({
        key: 'last_login_time',
        success: function(res) {
          // console.log(res)
          let time = new Date()
          let day = time.toLocaleDateString().split('/')[2]
          if (day != res.data){
            wx.removeStorage({
              key: 'cover_img',
              success: function (res) { console.log(res) },
            })
          }
          wx.setStorage({
            key: 'last_login_time',
            data: day,
          })
        },fail(e){
          let time = new Date()
          let day = time.toLocaleDateString().split('/')[2]
          wx.setStorage({
            key: 'last_login_time',
            data: day,
          })
          wx.removeStorage({
            key: 'cover_img',
          })
        }
      })

    //创建websocket链接
    // let socketTask = wx.connectSocket({
    //   url: 'wss://www.fosuchao.com/api/lengying/service/get_notify',
    //   success(e){
    //     console.log(e)
    //     console.log(socketTask)
    //     socketTask.onMessage((res)=>{
    //       console.log(res)
    //     })
    //   },
    //   fail(e) { console.log(e) }
    // }) 

  },

  updateGeo(){
    let self = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        if (self.globalData.cry_id){
          let data = {
            latitude: res.latitude,
            longitude: res.longitude,
            uid: self.globalData.cry_id
          }
          self.globalData.location = {
            lat: res.latitude,
            long: res.longitude,
          }
          // console.log(data)
          wx.request({
            url: `${urls.get_userGeo}`,
            method: 'POST',
            data: data,
            header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
            success(r_res) {
              // console.log(r_res)
            }
          })
        }
        else {
          wx.cloud.callFunction({
            name: 'login',
            success(res) {
              self.globalData.cry_id = md5(res.result.openid)
              let data = {
                latitude: res.latitude,
                longitude: res.longitude,
                uid: self.globalData.cry_id
              }
              self.globalData.location = {
                lat: res.latitude,
                long: res.longitude,
              }
              // console.log(data)
              wx.request({
                url: `${urls.get_userGeo}`,
                method: 'POST',
                data: data,
                header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
                success(r_res) {
                  // console.log(r_res)
                }
              })
            }
          })
        }
      },
      fail(e) { console.log(e) }
    })
  },


  globalData: {
    authSetting: null,
    userInfo: null,
    nav_bar_height: null,
    system: null,
    share: 0,
    system_type: null,
    cry_id: null,
    sub_num: 0,
    fans_num: 0,
    preview_img_data: null,
    userpage_data: null,
    temp_coll_data: null,
    lengying_userinfo: null,
    notifyData: null,
    tempTalkItem: {},
    talkToUserInfo: null,
    market_data: null,
    activity_data: null
  },
})
