// pages/product/product.js
const app = getApp()
const urls = require('../../utils/config.js').urls

let per_page = 15;
let img_page = 0,
    coll_page = 0;

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '作品', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    autoplay: false,
    current: 0,
    img_page: 0,
    coll_page: 0,
    lineAniData: {},
    system: app.globalData.system,
    img_data_list: [],
    coll_data_list: [],
    img_tempURL_list: null,
    h_con_selectData: null,
    img_cloudID_list: [],
    coll_cloudID_list: [],
    img_height_list: [],
    img_width_list: []
  },

  onLoad(options){
    let self = this, d = self.data;
    wx.showLoading({
      title: '正在加载',
    })
    self.init_user_info(app.globalData.cry_id)
    this.setData({current: parseInt(options.current)})
    console.log(this.data.current)
    wx.createSelectorQuery().select('.h-con').boundingClientRect((res)=>{
      self.setData({ h_con_selectData: (res.height + res.top)})
    }).exec()

  },

  onReady(){
    const lineAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.lineAni = lineAni

    this.lineAni.translateX(this.data.current * (this.data.system.windowWidth / 2)).step() 
    this.setData({
      lineAniData: this.lineAni.export()
    })
  },

  go_detailColl(e) {
    app.globalData.temp_coll_data = e.currentTarget.dataset.item

    wx.navigateTo({
      url: `../search/detail_coll/detail_coll`,
    })
  },

  init_user_info(uid) {
    let self = this, d = self.data;
    wx.request({
      url: `${urls.get_info_user}?uid=${uid}`,
      success(res) {
        if (res.data.imgs.length != 0) {
          let temp_img_id_list = []
          res.data.imgs.forEach((item) => {
            temp_img_id_list.push(item.iid)
          })
          wx.cloud.getTempFileURL({
            fileList: temp_img_id_list,
            success: cloud_res => {
              cloud_res.fileList.forEach((f_item, f_index)=>{
                res.data.imgs[f_index].tempFileURL = f_item.tempFileURL
              })
              self.setData({
                img_data_list: res.data.imgs,
                img_page: d.img_page + 1
              })
              wx.hideLoading()
              self.do_poll()
              self.showImg_2(res.data.imgs)
            },
            fail: console.error
          })
        }

        if (res.data.colls.length != 0) {
          console.log(res.data.colls)
          // 获取影集中预览图片中的cloud_id
          let temp_coll_id_list = [];
          let temp_coll_index_list = [];
          res.data.colls.forEach((item, index) => {
            if (item.priview_photo.indexOf('lengying') != -1) {
              // 如果是云存储的内容
              temp_coll_id_list.push(item.priview_photo.split('_').join('.'))
              temp_coll_index_list.push(index)
            }
          })

          wx.cloud.getTempFileURL({
            fileList: temp_coll_id_list,
            success: cloudRes => {
              cloudRes.fileList.forEach((item, index) => {
                res.data.colls[temp_coll_index_list[index]].priview_photo = item.tempFileURL
              })
              self.setData({
                coll_data_list: res.data.colls.length != 0 ? res.data.colls : null,
                coll_page: d.coll_page + 1
              })
              wx.hideLoading()
            },
            fail: console.error
          })
        }
        if (!res.data.colls.length && !res.data.imgs.length) 
         wx.hideLoading()
      }
    })
  },

  goPublish(){
    wx.navigateTo({
      url: '../publish/upload/upload',
    })
  },

  do_poll: function () {
    let self = this;
    let img_list = self.data.img_data_list
    let img_width = self.data.system.screenWidth * 0.49
    let temp_h = [0, 0], temp_w = [0, 1];
    let height_list = []
    let real_height, i, min_height, index, current_height;
    for (i = 0; i < img_list.length; i++) {
      if (i < 2) {
        real_height = img_list[i].height / img_list[i].width * img_width
        height_list.push(real_height)
      } else {
        if (height_list[0] < height_list[1]) {
          min_height = height_list[0]
          index = 0;
        } else {
          min_height = height_list[1]
          index = 1;
        }
        current_height = img_list[i].height / img_list[i].width * img_width
        //console.log(temp_h)
        //console.log(current_height)
        temp_h.push(min_height)
        temp_w.push(index)
        height_list[index] += current_height
      }
    }
    self.setData({
      img_height_list: temp_h,
      img_width_list: temp_w,
    })
    // console.log(self.data.img_height_list, self.data.img_width_list)
  },

  swiperChange(e){
    if(e.detail.current){
      this.lineAni.translateX(this.data.system.windowWidth / 2).step()
    }
    else{
      this.lineAni.translateX(0).step()
    }
    this.setData({ current: e.detail.current, lineAniData: this.lineAni.export()})
  },

  tapChangeSwiper(e){
    this.setData({current: e.currentTarget.dataset.index})
  },

  goCreateColl(){
    wx.navigateTo({
      url: './createColl/createColl',
    })
  },

  previewImg: function (e) {
    let self = this;
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    console.log(e.currentTarget.dataset.item)
    wx.navigateTo({
      url: `../preview/preview`
    })
  },
})