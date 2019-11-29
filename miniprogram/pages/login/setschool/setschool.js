// pages/login/setschool/setschool.js
const app = getApp()
const urls = require('../../../utils/config.js').urls
const university_index = require('../../../utils/config.js').university_index

Page({

  data: {
    region: ['广东省', '广州市', '天河区'],
    school_index: 0,
    school_list: [],
    init_province: '广东省',
    input_school: null,
  },


  onLoad: function (options) {
    let self = this, d = self.data
    this.update_university(d.init_province)
  },

  confirm_edit() {
    let self = this, d = self.data;
    let school = d.school_list[d.school_index]

    if (d.input_school && d.input_school.length < 4){
      wx.showModal({
        title: '错误',
        content: '校名长度应大于4个字符',
        showCancel: false,
        success(res){
          return 
        }
      })
      return 
    }
    else if (d.input_school && d.input_school.length >= 4){
      school = d.input_school
    }

    wx.showLoading({
      title: '保存中',
    })
    wx.request({
      url: `${urls.update_info_user}`,
      method: "POST",
      data: {
        uid: app.globalData.cry_id,
        location: d.region,
        school: school,
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res) {
        wx.hideLoading()
        self.switchto_index()
      }
    })
  },

  switchto_index(){
    wx.reLaunch({
      url: '../../index/index?_switch=1',
      success(){
        let i;
        for (i = 0; i < app.globalData.notifyData.length; i++) {
          if (!app.globalData.notifyData[i].is_read) {
            wx.showTabBarRedDot({
              index: 3,
              success() {
              },
              fail(e) { console.log(e) }
            })
            break;
          }
        }
      }
    })
  },

  update_university(e) {
    console.log(e)
    let self = this, d = self.data;
    let index = university_index[e], temp_list = []
    wx.request({
      url: `${urls.get_university}?index=${index}`,
      success(res) {
        res.data.schools.forEach((item) => {
          if (item.city == d.region[1])
            temp_list.push(item.name)
        })
        self.setData({
          school_list: temp_list,
        })
      }
    })
  },

  bindSchoolChange(e) {
    console.log(e.detail.value, typeof (e.detail.value))
    this.setData({ school_index: e.detail.value })
  },

  blur(e){
    console.log(e)
    // let value = e.detail.value
    if (e.detail.value !== ''){
      this.setData({
        input_school: e.detail.value
      })
    }else{
      this.setData({
        input_school: null
      })
    }
    
  },

  bindRegionChange(e) {
    let self = this
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
    self.update_university(e.detail.value[0])
  },

})