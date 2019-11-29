// pages/search/activity/activity.js
const app = getApp()
const urls = require('../../../utils/config.js').urls
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '活动', //导航栏 中间的标题
      // 此页面 页面内容距最顶部的距离
    },
    height: app.globalData.nav_bar_height,
    datalist:[]
  },

  onLoad: function (options) {
    this.initActivity()
  },

  initActivity() {
    let self = this
    wx.request({
      url: `${urls.get_activity}`,
      success(res) {
        console.log(res)
        if (res.data.activity.length){
          self.setData({
            datalist: res.data.activity
          })
        }
      }
    })
  },

  go_detail(e){
      app.globalData.activity_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `./detail/detail`,
    })
  },
})