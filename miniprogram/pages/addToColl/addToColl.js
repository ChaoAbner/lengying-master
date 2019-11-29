// pages/addToColl/addToColl.js
const app = getApp()
const urls = require('../../utils/config.js').urls

let per_page = 20;
let imgToColl;

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '影集', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    coll_data_list: [],
    coll_page: 0
  },

  onLoad(options){
    imgToColl = app.globalData.tempImgToColl
    console.log(imgToColl)
    this.initCollData();
  },

  initCollData(){
    let self = this, d = self.data;
    wx.request({
      url: `${urls.get_person_coll}?uid=${app.globalData.cry_id}&page=${d.coll_page}&per_page=${per_page}`,
      success(res) {
        // 处理预览为cloudID的情况
        let temp_coll_data = res.data
        let temp_cloudID_list = []
        let temp_cloudID_index_list = []
        temp_coll_data.forEach((item, index) =>{
          if(item.priview_photo.indexOf('lengying') != -1){
            temp_cloudID_list.push(item.priview_photo.split('_').join('.'))
            // 将id替换为临时链接
            temp_cloudID_index_list.push(index)
          }
        })
        wx.cloud.getTempFileURL({
          fileList: temp_cloudID_list,
          success: cloudRes => {
            cloudRes.fileList.forEach((item, index)=>{
              temp_coll_data[temp_cloudID_index_list[index]].priview_photo = item.tempFileURL
            })
            self.setData({
              coll_data_list: temp_coll_data.length != 0 ? temp_coll_data : null,
              coll_page: d.coll_page + 1
            })
          },
          fail: console.error
        })
      },
      fail: error => console.log(error)
    })
  },

  goCreateColl(){
    wx.navigateTo({
      url: '../product/createColl/createColl',
    })
  },

  addImgToColl(e){
    wx.showLoading({
      title: '加载中',
    })
    console.log(e)
    let cid = e.currentTarget.dataset.cid
    let data = {
      data: JSON.stringify(imgToColl),
      cid: cid
    }
    console.log(cid)
    wx.request({
      url: `${urls.add_img_to_coll}`,
      method: 'POST',
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res){
        if(res.data == 'error'){
          wx.showToast({
            title: '该图片已存在',
            icon: 'none',
            // duration: 1500
          })
        }
        else{
          wx.showToast({
            title: '添加成功',
            // duration: 1500
          })
          let backTimeout = setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            })
          }, 1000) 
        }
        wx.hideLoading()
        console.log(res)
      }
    })
  },

})