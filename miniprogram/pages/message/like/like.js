// pages/message/like/like.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

const per_page = 10
let lock = 0
Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '点赞', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    show_message: '暂时还没有收到点赞消息哦',
    data_list: [],
    page: 0,
  }, 

  onLoad(){
    this.getData()
  },

  getData(){
    wx.showLoading({
      title: '加载中',
    })
    let self = this
    let tempData = self.data.data_list
    wx.request({
      url: `${urls.get_remind}?uid=${app.globalData.cry_id}&type=like&page=${self.data.page}&per_page=${per_page}`,
      success(res){
        if (res.data.length && typeof (res.data) == 'object'){
          let tempCloudID = []
          res.data.forEach((item, index)=>{
            item.create_at = item.create_at.split('T')[0].split('-').join('/') + " "+ item.create_at.split('T')[1].split('.')[0]
            tempCloudID.push(item.target_id)
          })
          wx.cloud.getTempFileURL({
            fileList: tempCloudID,
            success: cloud_res => {
              cloud_res.fileList.forEach((item, index)=>{
                res.data[index].target.tempFileURL = item.tempFileURL
              })
              self.setData({
                data_list: tempData.concat(res.data),
              })
              console.log(res.data)
            },
            fail: console.error
          })
          self.setData({
            data_list: tempData.concat(res.data),
            page: self.data.page + 1
          })
        }
        else {
          if(self.data.page !== 0)
            wx.showToast({
              title: '加载完毕',
              icon: 'none'
            })
        }
        lock = 0
        wx.hideLoading()
      }
      
    })
  },

  onReachBottom() {
    let self = this
    if (!lock) {
      lock = 1
      self.getData()
    }
  },

  go_userpage(e){
    app.globalData.userpage_data = e.currentTarget.dataset.item
    if (e.currentTarget.dataset.item.cover_img) {
      wx.navigateTo({
        url: `../../userpage/userpage_real/userpage_real`,
      })
    }
  },

  previewImg(e){
    let item = e.currentTarget.dataset.item
    item.iid = item.iid.split('.').join('_')
    app.globalData.preview_img_data = item
    console.log(app.globalData.preview_img_data)
    wx.navigateTo({
      url: `../../preview/preview`
    })
  }

})