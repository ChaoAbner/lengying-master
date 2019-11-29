// pages/userpage/userpage.js
const app = getApp()
const urls = require('../../utils/config.js').urls
let page_i = 1,
  page_l = 1,
  page_c = 1;
let temp_subscribe_obj = {};
// var _tran_data = {
//   t_1: {
//     width: 0,
//     left: 0,
//   },
//   t_2: {
//     width: 0,
//     left: 0,
//   },
//   t_3: {
//     width: 0,
//     left: 0,
//   }
// }

let bottom_lock = 0, first = 1;
Page({
  data: {
    // transition:{
    //   old_x: null,
    //   new_x: null,
    //   distance: null,
    //   param: null,
    //   tarn_x: null,
    // },
    use_info: 0,
    userinfo: null,
    // tran_data: {},
    username: null,
    height: app.globalData.nav_bar_height,
    avater: null,
    current: 0,
    autoplay: false,
    // lineAniData:{},
    imgs_list: null,
    likes_list: null,
    colls_list: null,
    system: app.globalData.system,
    img_height_list: [],
    img_width_list: [],
    like_img_height_list: [],
    like_img_width_list: [],
    img_height_list_length: 0,
    like_height_list_length: 0,
    img_down: false,
    like_down: false,
    coll_down: false,
    page_i: 1,
    page_l: 1,
    page_c: 1,
    sub_data: {},
    id: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this, d=  self.data;
    let userpage_data = app.globalData.userpage_data
    self.init_data(userpage_data.username) // 初始化用户数据
    wx.getStorage({
      key: 'subscribe',
      success: function(res) {
        self.setData({ sub_data: res.data})
      },
    })
    if (userpage_data.avater){
      self.setData({
        username: userpage_data.username,
        id: userpage_data.uid,
        avater: userpage_data.avater,
        system_type: app.globalData.system_type
      })
    }
    else{
      self.setData({
        username: userpage_data.username,
        id: userpage_data.id,
        avater: userpage_data.profile_image.medium,
        system_type: app.globalData.system_type
      })
    }
  },

  set_under_line: function(){
    let self = this, d = self.data;
    let $ = wx.createSelectorQuery()
    for (let i = 1; i < 4; i++) {
      $.select('.tarbar > .text-' + i).boundingClientRect(function (res) {
        _tran_data['t_' + i].width = res.width
        _tran_data['t_' + i].left = res.left
      }).exec()
    }
    let tranDataTimeOut = setTimeout(() => {
      self.setData({ tran_data: _tran_data })
      // wx.hideLoading()
      clearTimeout(tranDataTimeOut)
    }, 300)
  },

  onReady(){
    const lineAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.lineAni = lineAni
  },

  back_navg: function () {
    wx.navigateBack({
      delta: 1
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

  init_data: function(username){
    let self = this, d = self.data;
    const per_page = 10;
    let temp_userinfo;
    wx.request({
      url: `${urls.get_user_img}?username=${username}&page=${d.page_i}&per_page=${per_page}`,
      success: res =>{
        if(res.data.length == 0){
          wx.request({
            url: `${urls.get_user_info}?username=${username}`,
            success: res=>{
              self.setData({
                use_info: 1,
                userinfo: res.data
              })
              temp_userinfo = res.data 
              // self.set_under_line()
            }
          })
        }

        self.setData({
          imgs_list: res.data,
          img_height_list_length: res.data.length,
          img_down: res.data.length > 9 ? false : true,
          page_i: d.page_i + 1
        })
        // console.log('img_down')
        // console.log(`${res.data.length} > ${per_page}`)
        // console.log(d.img_down)
        // page_i += 1
        self.do_poll(res.data, 'img')
        // if (res.data.length != 0) self.set_under_line()
      }
    })

    wx.request({
      url: `${urls.get_user_coll}?username=${username}&page=${d.page_c}&per_page=${per_page}`,
      success: res => {
        self.setData({
          colls_list: res.data,
          coll_down: res.data.length > 9 ? false : true,
          page_c: d.page_c + 1
        })
        // console.log('coll down')
        // console.log(`${res.data.length} > ${per_page}`)
        // console.log(d.coll_down)
        // page_c += 1
      }
    })

    wx.request({
      url: `${urls.get_user_likes}?username=${username}&page=${d.page_l}&per_page=${per_page}`,
      success: res => {
        self.setData({
          likes_list: res.data,
          like_height_list_length: res.data.length,
          like_down: res.data.length > 9 ? false : true,
          page_l: d.page_l + 1
        })
        // console.log('like_down')
        // console.log(`${res.data.length} > ${per_page}`)
        // console.log(d.like_down)
        // page_l += 1
        self.do_poll(res.data, 'likes')
      }
    })
  },


  page_change: function(e){
    let self = this, d = self.data;
    let n_current = e.detail.current
    // if (n_current === 0){
    //   console.log(d.tran_data['t_1'].width)
    //   this.lineAni.width(d.tran_data['t_1'].width)
    //   this.lineAni.translateX(0).step()
    // } else if (n_current === 1){
    //   console.log(d.tran_data['t_2'].width)
    //   this.lineAni.width(d.tran_data['t_2'].width)
    //   this.lineAni.translateX(d.tran_data['t_2'].left - d.tran_data['t_1'].left).step()
    // } else{
    //   console.log(d.tran_data['t_3'].width)
    //   this.lineAni.width(d.tran_data['t_3'].width)
    //   this.lineAni.translateX(d.tran_data['t_3'].left - d.tran_data['t_1'].left).step()
    // }
    
    self.setData({ 
      current: n_current,
      // lineAniData: this.lineAni.export()
    })
  },

  tap_change: function(e){
    let self = this, d = self.data;
    self.setData({
      current: e.currentTarget.dataset.current
    })
  },


  scroll_to_bottom: function(e){
    let self = this, d = self.data;
    let current = e.target.dataset.current
    let temp_list, per_page = 20;
    let data_list = d.use_info ? d.userinfo : d.imgs_list[0].user


    wx.pageScrollTo({
      scrollTop: d.system.screenHeight * 0.4,
      duration: app.globalData.system_type ? 300 : 0
    })

    if ((current === '0') && (d.imgs_list.length < data_list.total_photos) && !bottom_lock){
      // self.show_loading()
      bottom_lock = 1;
      temp_list = d.imgs_list
        wx.request({
          url: `${urls.get_user_img}?username=${d.username}&page=${d.page_i}&per_page=${per_page}`,
          success: res=>{
            if (res.data.length === 0) self.setData({ img_down: true})
            res.data.forEach(function(item){
              temp_list.push(item)
            })
            self.setData({
              imgs_list: temp_list,
              img_height_list_length: temp_list.length,
              page_i: d.page_i + 1
            })
            // page_i += 1
            self.do_poll(temp_list, 'img')
            bottom_lock = 0
          }
        })
    }

    if ((current === '1') && (d.likes_list.length < data_list.total_likes) && !bottom_lock) {
      // self.show_loading()
      bottom_lock = 1
      temp_list = d.likes_list
        wx.request({
          url: `${urls.get_user_likes}?username=${d.username}&page=${d.page_l}&per_page=${per_page}`,
          success: res => {
            if (res.data.length === 0) self.setData({ like_down: true })
            res.data.forEach(function (item) {
              temp_list.push(item)
            })
            self.setData({
              likes_list: temp_list,
              like_height_list_length: temp_list.length,
              page_l: d.page_l + 1
            })
            // page_l += 1
            self.do_poll(temp_list, 'likes')
            bottom_lock = 0
          }
        })
    }

    if ((current === '2') && (d.colls_list.length < data_list.total_collections) && !bottom_lock) {
      // self.show_loading()
      bottom_lock = 1
      temp_list = d.colls_list
        wx.request({
          url: `${urls.get_user_coll}?username=${d.username}&page=${d.page_c}&per_page=${per_page}`,
          success: res => {
            if (res.data.length === 0) self.setData({ coll_down: true })
            res.data.forEach(function (item) {
              temp_list.push(item)
            })
            self.setData({
              colls_list: temp_list,
              page_c: d.page_c + 1
            })
            // page_c += 1
            bottom_lock = 0
          }
        })
    }
    
  },

  scroll_to_upper: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: app.globalData.system_type ? 300 : 0
    })
  },

  show_loading(){
    wx.showLoading({
      title: '加载中',
    })
  },

  previewImg: function (e) {
    let self = this;
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../preview/preview`
    })
  },

  coll_detail: function (e) {
    console.log(e)
    // let _id = e.currentTarget.dataset.id
    // let mess = e.currentTarget.dataset.mess
    // let publish_time = mess.published_at
    // let total_photos = mess.total_photos
    // let user_name = mess.user.username
    // let user_avater = mess.user.profile_image.small
    // let title = mess.title
    app.globalData.temp_coll_data = e.currentTarget.dataset.mess
    wx.navigateTo({
      url: `../search/detail_coll/detail_coll`,
    })
  },

  doSubscribe(e) {
    let self = this, d = self.data;
    let id = d.id
    let user = d.username
    temp_subscribe_obj = d.sub_data
    if (temp_subscribe_obj[id]) {
      // 如果已关注，则取消关注
      temp_subscribe_obj[id] = 0;
      self.update_subscribe_user(0, user)
    } else {
      // 未关注，则关注
      temp_subscribe_obj[id] = 1;
      self.update_subscribe_user(1, user)
      wx.showToast({
        title: '关注成功',
        icon: 'none',
        duration: 1000
      })
    }
    self.setData({ sub_data: temp_subscribe_obj })
    temp_subscribe_obj = {}
    console.log(d.sub_data)
    // 更新缓存
    wx.setStorage({
      key: 'subscribe',
      data: d.sub_data,
    })
    wx.request({
      url: `${urls.subscribe}`,
      method: 'POST',
      data: {
        uid: app.globalData.cry_id,
        data: JSON.stringify(d.sub_data)
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res) {
        console.log(res)
      }
    })
    self.update_sub_num(d.sub_data)
  },

  update_subscribe_user(type, user) {
    let self = this, d = self.data;
    // type = 0 取消关注，删除数据库中的关注用户
    // type = 1  添加关注，添加数据库中的关注用户
    let uid = app.globalData.cry_id,
      tid = d.id,
      userinfo = {
        uid: tid,
        username: d.username,
        avater: d.avater,
        total_photos: !d.use_info ? d.imgs_list[0].user.total_photos : d.userinfo.total_photos,
      }
    let data = {
      type: type,
      uid: uid,
      tid: tid,
      userinfo: JSON.stringify(userinfo),
      sub_userinfo: JSON.stringify(app.globalData.lengying_userinfo)
    }
    self.sub_user_method(data)
  },

  sub_user_method(data) {
    wx.request({
      url: `${urls.subscribe_userinfo}`,
      method: 'POST',
      data: data,
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res) {
        console.log(res)
      }
    })
  },

  update_sub_num(sub_obj) {
    let sub_list = Object.values(sub_obj)
    let num = 0;
    sub_list.forEach((item) => {
      if (item == 1) num++;
    })
    app.globalData.sub_num = num
  },
  

})