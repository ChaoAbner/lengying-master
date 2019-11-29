// pages/me/like/like.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

const per_page = 10
let lock = 0
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '我喜欢的', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    uid: null,
    data_list: [],
    page: 0,
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let self = this, d = self.data;
    let navbarTitle = 'nvabarData.title'
    this.setData({
      [navbarTitle]: options.title,
      uid: options.uid
    })
    self.initLikeInfo()
    console.log(d.system)
  },

  onReachBottom(){
    let self = this, d = self.data;
    if(!lock){
      wx.showLoading({
        title: '加载中',
      })
      lock = 1
      let tempData = self.data.data_list
      wx.request({
        url: `${urls.like_userinfo}?uid=${self.data.uid}&page=${self.data.page}&per_page=${per_page}`, success(res) {
          console.log(res)
          if (res.data.length != 0) {
            let temp_iid_index_list = []
            let temp_iid_list = []
            res.data.forEach((item, index) => {
              if (item.iid) {
                temp_iid_index_list.push({
                  id: item.iid.split('_').join('.'),
                  index: index
                })
                temp_iid_list.push(item.iid.split('_').join('.'))
              }
            })
            console.log(temp_iid_list)

            wx.cloud.getTempFileURL({
              fileList: temp_iid_list,
              success: resTempURL => {
                console.log(resTempURL.fileList)
                resTempURL.fileList.forEach((item, index) => {
                  res.data[temp_iid_index_list[index].index].tempFileURL = item.tempFileURL
                })
                self.setData({
                  data_list: tempData.concat(res.data),
                  page: self.data.page + 1
                })
                lock = 0
              },
              fail: console.error
            })
          }
          wx.hideLoading()
        }
      })
    }
  },

  initLikeInfo(){
    let self = this
    let tempData = self.data.data_list
    wx.request({
      url: `${urls.like_userinfo}?uid=${self.data.uid}&page=${self.data.page}&per_page=${per_page}`,
      success(res){
        console.log(res)
        if(res.data.length != 0){
          let temp_iid_index_list = []
          let temp_iid_list = []
          res.data.forEach((item, index)=>{
            if(item.iid){
              temp_iid_index_list.push({
                id: item.iid.split('_').join('.'),
                index: index
              })
              temp_iid_list.push(item.iid.split('_').join('.'))
            }
          })
          console.log(temp_iid_list)

          wx.cloud.getTempFileURL({
            fileList: temp_iid_list,
            success: resTempURL => {
              console.log(resTempURL.fileList)
              resTempURL.fileList.forEach((item, index) => {
                res.data[temp_iid_index_list[index].index].tempFileURL = item.tempFileURL
              })
              self.setData({
                data_list: tempData.concat(res.data),
                page: self.data.page + 1
              })
            },
            fail: console.error
          })
        }
        wx.hideLoading()
      }
    })
  },

  previewImg(e){
    let item = e.currentTarget.dataset.item
    if(item.iid){
      wx.request({
        url: `${urls.get_img_info}iid=${item.iid}`,
        success(res){
          res.data.user = item.user
          res.data.tempFileURL = item.tempFileURL
          app.globalData.preview_img_data = res.data
          wx.navigateTo({
            url: '../../preview/preview',
          })
        }
      })
    }
    else{
      app.globalData.preview_img_data = item
      wx.navigateTo({
        url: '../../preview/preview',
      })
    }
  },

 
})