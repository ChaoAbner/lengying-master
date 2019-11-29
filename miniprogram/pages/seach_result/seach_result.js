// pages/seach_result/seach_result.js
const app = getApp()
let urls = require('../../utils/config.js').urls, temp_list, bottom_lock = 0;

var _tran_data = {
  t_1: {
    width: 0,
    left: 0,
  },
  t_2: {
    width: 0,
    left: 0,
  },
  t_3: {
    width: 0,
    left: 0,
  }
}

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '棱影', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.system.statusBarHeight,
    header_height: app.globalData.nav_bar_height - app.globalData.system.statusBarHeight,
    system: app.globalData.system,
    search_key: null,
    imgs_list: null,
    colls_list: null,
    users_list: null,
    current: 0,
    lineAniData: {},
    autoplay: false,
    all_data: null,
    tran_data: {},
    img_height_list: null,
    img_width_list: null,
    page_i: 2,
    page_c: 2,
    page_u: 2,
  },

  onLoad: function (options) {
    let self = this, d = self.data;
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    self.init_data(options.value)
    self.setData({
      search_key: options.value,
    })
  },

  onReady() {
    const lineAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.lineAni = lineAni
  },

  show_loading() {
    wx.showLoading({
      title: '加载中',
    })
  },

  scroll_to_bottom: function (e) {
    let self = this, d = self.data;
    let p_list = 'all_data.photos.results'
    let c_list = 'all_data.collections.results'
    let u_list = 'all_data.users.results'
    let current = e.target.dataset.current
    let per_page = 20;
    let p_total = (typeof (temp_list.photos.total) == "string") ? 
    parseInt(temp_list.photos.total) * 1000  : temp_list.photos.total
    let c_total = (typeof (temp_list.collections.total) == "string") ?
     parseInt(temp_list.collections.total) * 1000 : temp_list.collections.total
    let u_total = (typeof (temp_list.users.total) == "string") ? ((temp_list.users.total.indexOf('k') == -1) ? parseInt(temp_list.users.total) * 1000 : temp_list.users.total) : temp_list.users.total
   
    wx.pageScrollTo({
      scrollTop: d.system.windowHeight,
      duration: app.globalData.system_type ? 400 : 0
    })

    if ((current === '0') && (temp_list.photos.results.length < p_total) && !bottom_lock){
      self.show_loading()
      bottom_lock = 1;
      wx.request({
        url: `${urls.get_photos_search_res}?q=${d.all_data.meta.keyword}&page=${d.page_i}&per_page=20`,
        success: res => {
          res.data.results.forEach(function (item) {
            temp_list.photos.results.push(item)
          })
          self.setData({
            [p_list]: temp_list.photos.results,
            page_i: d.page_i + 1
          })
          self.do_poll(temp_list.photos.results, 'img')
          wx.hideLoading()
          bottom_lock = 0
        }
      })
    }

    if ((current === '1') && (temp_list.collections.results.length < c_total) && !bottom_lock) {
      self.show_loading()
      bottom_lock = 1
      wx.request({
        url: `${urls.get_colls_search_res}?q=${d.all_data.meta.keyword}&page=${d.page_c}&per_page=${per_page}`,
        success: res => {
          res.data.results.forEach(function (item) {
            temp_list.collections.results.push(item)
          })
          self.setData({
            [c_list]: temp_list.collections.results,
            page_c: d.page_c + 1
          })
          self.do_poll(temp_list, 'likes')
          wx.hideLoading()
          bottom_lock = 0
        }
      })
    }

    if ((current === '2') && (temp_list.users.results.length < u_total) && !bottom_lock) {
      self.show_loading()
      bottom_lock = 1
      wx.request({
        url: `${urls.get_users_search_res}?q=${d.all_data.meta.keyword}&page=${d.page_u}&per_page=${per_page}`,
        success: res => {
          console.log(res)
          res.data.results.forEach(function (item) {
            temp_list.users.results.push(item)
          })
          self.setData({
            [u_list]: temp_list.users.results,
            page_u: d.page_u + 1
          })
          wx.hideLoading()
          bottom_lock = 0
        }
      })
    }
  },

  previewImg: function (e) {
    let self = this;
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../preview/preview`
    })
  },

  go_userpage: function (e) {
    console.log(e.currentTarget.dataset)
    app.globalData.userpage_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../userpage/userpage`,
    })
  },

  coll_detail: function (e) {
    app.globalData.temp_coll_data = e.currentTarget.dataset.mess
    wx.navigateTo({
      url: `../search/detail_coll/detail_coll`,
    })
  },

  init_data: function(value){
    let per_page = 20, self = this, d = self.data
    wx.request({
      url: `${urls.get_init_search_res}?q=${value}&per_page=${per_page}`,
      success: res =>{
        console.log(res.data)
        let p_total = (res.data.photos.total > 1000) ? 
        ((res.data.photos.total / 1000).toFixed(1) + 'k') : res.data.photos.total
        let c_total = (res.data.collections.total > 1000) ?
          ((res.data.collections.total / 1000).toFixed(1) + 'k') : res.data.collections.total
        let u_total = (res.data.users.total > 1000) ?
          ((res.data.users.total / 1000).toFixed(1) + 'k') : res.data.users.total
        res.data.photos.total = p_total
        res.data.collections.total = c_total
        res.data.users.total = u_total
        self.setData({
          all_data: res.data
        })
        self.set_under_line()
        self.do_poll(res.data.photos.results, 'img')
        temp_list = res.data
        wx.hideLoading()
      }
    })
  },

  do_poll: function (img_list, list_type) {
    let self = this;
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
        temp_h.push(min_height)
        temp_w.push(index)
        height_list[index] += current_height
      }
    }
    list_type == 'img' ?
      self.setData({
        img_height_list: temp_h,
        img_width_list: temp_w
      })
      :
      self.setData({
        like_img_height_list: temp_h,
        like_img_width_list: temp_w
      })
    // console.log(self.data.img_height_list, self.data.img_width_list)
  },

  set_under_line: function () {
    let self = this, d = self.data;
    let $ = wx.createSelectorQuery()
    for (let i = 1; i < 4; i++) {
      $.select('.tarbar > .text-' + i).boundingClientRect(function (res) {
        _tran_data['t_' + i].width = res.width
        _tran_data['t_' + i].left = res.left
      }).exec()
    }
    setTimeout(() => {
      self.setData({ tran_data: _tran_data })
      wx.hideLoading()
    }, 300)
  },

  back_page: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  page_change: function (e) {
    let self = this, d = self.data;
    let n_current = e.detail.current
    if (n_current === 0) {
      console.log(d.tran_data['t_1'].width)
      this.lineAni.width(d.tran_data['t_1'].width)
      this.lineAni.translateX(0).step()
    } else if (n_current === 1) {
      console.log(d.tran_data['t_2'].width)
      this.lineAni.width(d.tran_data['t_2'].width)
      this.lineAni.translateX(d.tran_data['t_2'].left - d.tran_data['t_1'].left).step()
    } else {
      console.log(d.tran_data['t_3'].width)
      this.lineAni.width(d.tran_data['t_3'].width)
      this.lineAni.translateX(d.tran_data['t_3'].left - d.tran_data['t_1'].left).step()
    }


    self.setData({
      current: n_current,
      lineAniData: this.lineAni.export()
    })
  },

  tap_change: function (e) {
    let self = this, d = self.data;
    self.setData({
      current: e.currentTarget.dataset.current
    })
  },

  scroll_to_upper: function(){
    wx.pageScrollTo({
      scrollTop: 0,
      duration: app.globalData.system_type ? 400 : 0
    })
  }

 
})