const app = getApp()
const urls = require('../../../utils/config.js').urls

const per_page = 15
let lock = 0
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '我的粉丝', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    data_list: null,
    page: 0,
    uid: null,
  },

  onLoad(options) {
    let self = this
    console.log(options.id)
    let navbarTitle = 'nvabarData.title'
    this.setData({
      [navbarTitle]: options.title,
      uid: options.uid
    })
    self.init_fans_data()
  },

  onReachBottom() {
    wx.showLoading({
      title: '加载中',
    })
    let self = this, d = self.data
    if (!lock) {
      let tempData = d.data_list
      lock = 1
      wx.request({
        url: `${urls.fans_userinfo}?uid=${d.uid}&page=${self.data.page}&per_page=${per_page}`,
        success(res) {
          console.log(res)
          if(res.data.length){
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

  init_fans_data() {
    let self = this, d = self.data
    wx.request({
      url: `${urls.fans_userinfo}?uid=${d.uid}&page=${self.data.page}&per_page=${per_page}`,
      success(res) {
        console.log(res)
        self.setData({
          data_list: res.data.length == 0 ? null : res.data,
          page: self.data.page + 1
        })
      }
    })
  },

  go_userpage(e) {
    app.globalData.userpage_data = e.currentTarget.dataset.user
    if (e.currentTarget.dataset.user.avater.indexOf('wx.qlogo.cn') != -1) {
      wx.navigateTo({
        url: `../../userpage/userpage_real/userpage_real`,
      })
    }
    else {
      wx.navigateTo({
        url: `../../userpage/userpage`,
      })
    }
  }
})