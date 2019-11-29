// pages/me/feedback/feedback.js
const app = getApp();
const urls = require('../../../utils/config.js').urls
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '意见反馈', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    text: '',
    input: '',
    feedback_list: ['卡顿、闪退', '图片质量不高', '图片加载缓慢', '交互体验感差', 
    '界面布局错位',  '功能不足', '操作麻烦'
      ]

  },

  add_feed(e){
    let choose = e.currentTarget.dataset.choose
    let value = this.data.text
    console.log(choose)
    value = value + ` ${choose}, `
    console.log(value)
    this.setData({ text: value})
  },

  textBlur(e){
    console.log(e)
    this.setData({ text: e.detail.value})
  },

  inputBlur(e) {
    console.log(e)
    this.setData({ input: e.detail.value })
  },

  submit(){
    let self = this, d = self.data;
    console.log(d.text, d.input)
    if (d.text && d.input){
      wx.showLoading({
        title: '正在提交',
      })
      wx.request({
        url: `${urls.feedback}`,
        method: "POST",
        data: {
          username: app.globalData.userInfo.nickName,
          text: d.text,
          contact: d.input
        },
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success(res){
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '提交成功',
            success(){
              let switch_ = setTimeout(()=>{
                wx.switchTab({
                  url: '../me',
                  success(){
                    clearTimeout(switch_)
                  }
                })
              },1000)
            }
          })
        }
      })
    }else{
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
    }
  }
})