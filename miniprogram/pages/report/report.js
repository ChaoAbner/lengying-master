// pages/report/report.js
const app = getApp();
const urls = require('../../utils/config.js').urls
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '举报', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    type: ['违法违规', '广告营销', '盗版侵权', '乱码坏图', '引起不适的内容'],
    choose_index: 0,
    id: null
  },

  choose_type(e){
    console.log(e)
    this.setData({ choose_index: e.currentTarget.dataset.index})
  },

  onLoad(options){
    this.setData({ id: options.id})
  },

  submit(){
    let d = this.data
    wx.showLoading({
      title: '正在提交',
    })
    wx.request({
      url: urls.report,
      method: "POST",
      data: {
        username: app.globalData.userInfo.nickName,
        id: d.id ,
        reportType: d.type[d.choose_index]
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res){
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提交成功',
          content: '我们已收到你的举报，会尽快处理',
          showCancel: false,
          success(res){
            if(res.confirm){
              wx.switchTab({
                url: '../index/index',
              })
            }
          }
        })
      }
    })
  }

})