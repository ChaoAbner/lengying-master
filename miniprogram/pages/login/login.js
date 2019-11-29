// pages/login/login.js
const app = getApp()
const urls = require('../../utils/config.js').urls
Page({

  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo;
      wx.showLoading({
        title: '加载中',
      })
      if(app.globalData.cry_id){
        let data = {
          uid: app.globalData.cry_id,
          username: e.detail.userInfo.nickName,
          avater: e.detail.userInfo.avatarUrl,
          login_accept: 'true',
          gender: e.detail.userInfo.gender
          // <!-- 判断gender 1为男 else为女 -->
        }
        wx.request({
          url: `${urls.new_push_user}`,
          method: 'POST',
          data: data,
          header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
          success(e) {
            app.globalData.notifyData = e.data.notify
            app.globalData.lengying_userinfo = e.data.user
            wx.navigateTo({
              url: './setschool/setschool',
            })
            
          },
          fail(e) { console.log(res) }
        })
      }
      else{
          wx.cloud.callFunction({
            name: 'login',
            success(res) {
              app.globalData.cry_id = md5(res.result.openid)
              let data = {
                uid: md5(res.result.openid),
                username: e.detail.userInfo.nickName,
                avater: e.detail.userInfo.avatarUrl,
                login_accept: 'true',
              }
              wx.request({
                url: `${urls.new_push_user}`,
                method: 'POST',
                data: data,
                header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
                success(e) {
                  app.globalData.notifyData = e.data.notify
                  app.globalData.lengying_userinfo = e.data.user
                  wx.navigateTo({
                    url: './setschool/setschool',
                  })
                  wx.navigateTo({
                    url: './setschool/setschool',
                  })
                },
                fail(e) { console.log(res) }
              })
            }
        })
      }
    }
    else {
      wx.showModal({
        title: '警告',
        content: '您拒绝了授权，将无法进入小程序，请授权后再进入！',
        showCancle: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  },

  go_agreement: function(){
    wx.navigateTo({
      url: './agreement/agreement',
    })
  }
})