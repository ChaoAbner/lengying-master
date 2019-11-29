// pages/me/editInfo/editInfo.js
const app = getApp();
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
const university_index = require('../../../utils/config.js').university_index
const urls = require('../../../utils/config.js').urls

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '编辑个人资料', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    userinfo: null,
    privinces: [],
    city_index: 0,
    region: ['广东省', '广州市', '天河区'],
    school: null,
    school_list: [],
    school_index: 0,
    actionSheetHidden: true,
    cover_img: null,
    description: '向大家介绍你自己'
  },

  onLoad: function (options) {
    let self = this
    self.setData({userinfo: app.globalData.userInfo})
    var qqmapsdk = new QQMapWX({
      key: 'PRABZ-3HZKW-FOGRU-ON5IA-DK55T-YABOB'
    }); // 初始化api
    //调用获取城市列表接口
    qqmapsdk.getCityList({
      success: function (res) {//成功后的回调
        //console.log(res);
        //console.log('省份数据：', res.result[0]); //打印省份数据
        self.setData({ privinces: res.result[0]})
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
    self.init_user_info()
  },

  confirm_edit(){
    let self = this, d = self.data;
    wx.showLoading({
      title: '保存中',
    })
    wx.request({
      url: `${urls.update_info_user}`,
      method: "POST",
      data: {
        uid: app.globalData.cry_id,
        location: d.region,
        school: d.school_list[d.school_index],
        description: d.description
      },
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      success(res){
        console.log(res)
        app.globalData.lengying_userinfo.school = d.school_list[d.school_index]
        let pages = getCurrentPages()
        let last_page = pages[pages.length - 2]
        last_page.setData({
          address_data: d.school_list[d.school_index]
        })
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          success(){
            let back_timeout = setTimeout(() => {
              wx.navigateBack({
                delta: 2,
                success(){
                  clearTimeout(back_timeout);
                }
              })
            }, 1500)
          }
        })
      }
    })
  },

  init_user_info(){
    let self = this, d = self.data;
    let userInfo = app.globalData.lengying_userinfo

    self.setData({
      description: (userInfo.description != "") ? userInfo.description : d.description,
      region: userInfo.location.split(','),
      school: userInfo.school == '设置你的高校' ? null : userInfo.school
    })

    if (userInfo.cover_img.indexOf('https') != -1){
      self.setData({ cover_img: userInfo.cover_img})
    }
    else{
      self.init_cover_img(userInfo.cover_img)
    }
    
    self.init_university()
  },

  input_confirm(e){
    console.log(e.detail.value)
    this.setData({
      description: e.detail.value == '' ? this.data.description : e.detail.value
    })
  },

  init_cover_img(cover_img_id){
    let self = this;
    let path = wx.getStorageSync('cover_img');
    if (path.length != 0){
      // console.log(path)
      self.setData({ cover_img: path })
    }else{
      wx.cloud.getTempFileURL({
        fileList: [cover_img_id],
        success: res => {
          console.log('temp file list')
          console.log(res.fileList)
          self.setData({ cover_img: res.fileList[0].tempFileURL })
          wx.setStorage({
            key: 'cover_img',
            data: res.fileList[0].tempFileURL,
          })
        },
        fail: err => {
          // handle error
        }
      })
    }
  },

  action_sheet(e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  change_backimg: function (e) {
    let self = this, d = self.data;
    let temp_path;
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '正在上传',
        })
        self.setData({ actionSheetHidden: true})
        temp_path = res.tempFilePaths[0]
        wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath: `${app.globalData.cry_id}/cover.jpg`,
          // 指定要上传的文件的小程序临时文件路径
          filePath: temp_path,
          // 成功回调
          success: res => {
            console.log('上传成功', res)
            self.setData({ cover_img: temp_path})
            wx.hideLoading()
            wx.request({
              url: `${urls.update_info_user}`,
              method: "POST",
              data: {
                uid: app.globalData.cry_id,
                cover_img: res.fileID,
                location: d.region,
                school: d.school_list[d.school_index]
              },
              header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
              success(e){
                wx.setStorage({
                  key: 'cover_img',
                  data: temp_path
                })
                let pages = getCurrentPages()
                let last_page = pages[pages.length - 2]
                last_page.setData({
                  cover_img: temp_path
                })
              }
            })
          },
        })
      }
    })
  },

  bindPickerChange(e){
    console.log(e)
    this.setData({
      city_index: e.detail.value
    })
  },

  bindRegionChange(e) {
    let self = this
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
    self.update_university(e.detail.value[0])
  },

  init_university(e){
    let self = this, d = self.data;
    self.update_university(d.region[0])
  },

  update_university(e){
    console.log(e)
    let self = this, d = self.data;
    let index = university_index[e], temp_list = []
    wx.request({
      url: `${urls.get_university}?index=${index}`,
      success(res){
        console.log(res)
        res.data.schools.forEach((item) => {
          if (item.city == d.region[1])
            temp_list.push(item.name)
        })
        console.log(temp_list[d.school_index])
        self.setData({ 
          school_list: temp_list, 
          school_index: (temp_list.indexOf(d.school) == -1) ? '0' : temp_list.indexOf(d.school).toString()
        })
      }
    })
  },

  bindSchoolChange(e){
    console.log(e.detail.value, typeof (e.detail.value))
    let self = this
    this.setData({ school_index: e.detail.value, school: self.data.school_list[e.detail.value]})
  }
})