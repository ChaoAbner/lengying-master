// pages/search/activity/detail/detail.js
const app = getApp()
const urls = require('../../../../utils/config.js').urls
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '活动详情', //导航栏 中间的标题
      // 此页面 页面内容距最顶部的距离
    },
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    activity: null,
    prize_box: []
  },


  onLoad: function (options) {
    let aid = options.id
    this.setData({
      activity: app.globalData.activity_data,
      prize_box: app.globalData.activity_data.prize.split('{\\n}')
    })
  },

  go_upload(){
    let self = this
    let is_school = 0
    if(self.data.activity.id == 1)
      is_school = 1
    
    wx.navigateTo({
      url: `../../../publish/upload/upload?activity_title=${self.data.activity.title}&aid=${self.data.activity.id}&is_school=${is_school}&mode=0`,
    })
  },

  back_navg(){
    wx.navigateBack({
      delta: 1
    })
  },

  
})