// pages/me/contact/contact.js
const app = getApp()
const urls = require('../../../utils/config.js').urls
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '联系我们', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    text: null,
    input: null,
    userCall: null
  },

  copy(){
    wx.setClipboardData({
      data: 'yc@fosuchao.com',
      success(){
        wx.showToast({
          title: '已复制邮箱信息'
        })
      }
    })
  },

  show_wx(){
    wx.previewImage({
      current: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/wx.jpg?sign=a3d80adc6c67e6ac9bb92a4806fb0864&t=1557386504', // 当前显示图片的http链接
      urls: ['https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/wx.jpg?sign=a3d80adc6c67e6ac9bb92a4806fb0864&t=1557386504'] // 需要预览的图片http链接列表
    })
  },

  // textBlur(e) {
  //   console.log(e)
  //   this.setData({ text: e.detail.value })
  // },

  // inputBlur(e) {
  //   console.log(e)
  //   this.setData({ input: e.detail.value })
  // },

  // userCall(e) {
  //   console.log(e)
  //   this.setData({ userCall: e.detail.value })
  // },

  // submit() {
  //   let self = this, d = self.data;
  //   console.log(d.text, d.input, d.userCall)
  //   if (d.text && d.input && d.userCall) {
  //     wx.showLoading({
  //       title: '正在提交',
  //     })
  //     wx.request({
  //       url: `${urls.contact}`,
  //       method: "POST",
  //       data: {
  //         username: app.globalData.userInfo.nickName,
  //         text: d.text,
  //         contact: d.input,
  //         userCall: d.userCall
  //       },
  //       header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
  //       success(res) {
  //         console.log(res)
  //         wx.hideLoading()
  //         wx.showToast({
  //           title: '提交成功',
  //           success() {
  //             let switch_ = setTimeout(() => {
  //               wx.switchTab({
  //                 url: '../me',
  //                 success() {
  //                   clearTimeout(switch_)
  //                 }
  //               })
  //             }, 1000)
  //           }
  //         })
  //       }
  //     })
  //   } else {
  //     wx.showToast({
  //       title: '请填写完整信息',
  //       icon: 'none'
  //     })
  //   }
  // }
})