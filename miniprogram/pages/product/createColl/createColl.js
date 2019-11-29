// pages/product/createColl/createColl.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '影集', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    tagLists: [],
    inputShow: 0,
    switch_: true,
    title: null,
    description: '暂无描述'
  },

  onLoad(options){
    console.log(options)
  },

  createColl(){
    if(this.data.title){
      wx.showLoading({
        title: '创建中',
      })
      let self = this, d = self.data
      let data = {
        uid: app.globalData.cry_id,
        title: d.title,
        description: d.description,
        tags: JSON.stringify(d.tagLists),
        is_private: d.switch_ ? 0 : 1
      }
      wx.request({
        url: `${urls.new_push_coll}`,
        method: 'POST',
        data: data,
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success(res) {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '创建成功',
          })
          let pages = getCurrentPages()
          let last_page = pages[pages.length - 2]
          let temp = last_page.data.coll_data_list == null ? [] : last_page.data.coll_data_list
          console.log(temp)
          temp.push(res.data)
          last_page.setData({
            coll_data_list: temp
          })
          let goProductTimeout = setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)

        }
      })
    }
    else{
      wx.showToast({
        title: '影集需要有标题哦',
        icon: 'none'
      })
    }
  },

  inputTag(){
    this.setData({
      inputShow: !this.data.inputShow
    })
  },

  inputBlur(e){
    console.log(e.detail.value)
    let value = e.detail.value
    let temp_list = this.data.tagLists
    temp_list.push(value)
    this.setData({
      inputShow: 0,
      tagLists: temp_list
    })
  },

  deleteTag(e){
    let index = e.currentTarget.dataset.index
    let temp_list = this.data.tagLists
    temp_list.splice(index, 1)
    this.setData({ tagLists: temp_list})
  },

  switchChange(e){
    console.log(e)
    this.setData({ switch_: e.detail.value})
  },

  setTitle(e){
    this.setData({ title: e.detail.value})
  },

  setDescription(e) {
    this.setData({ description: e.detail.value })
  },
})