// pages/me/me.js
const app = getApp();
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
const urls = require('../../utils/config.js').urls
const famous = require('../../utils/config.js').famous
import md5 from '../../utils/md5.js'
let download_logo = null,
  download_bg = null,
  download_qr = null
let has_img_boxWidth = 0;
let img_ratio_list = [],
    temp_img_height_list = []


let is_scroll = 1;

Page({
  data: {
    userinfo: null,
    autoplay: false,
    address_data: '设置你的高校',
    current: 0,
    // animationData: {},
    canvasAniData: {},
    height:null,
    dynamic_img:{},
    lineAniData: {},
    system: app.globalData.system,
    cover_img: null,
    actionSheetHidden: true,
    canvas_hidden: true,
    draw_img_urls:{
      logo: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/logo.jpg?sign=0accc338662711908953393b4dff51f2&t=1557385812',
      bg: 'https://www.fosuchao.com/api/lengying/images/random',
      qr: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/qr.jpg?sign=02e8c95533e859f5a362d46b6cc63101&t=1557385880'
    },
    canvas_img_url: null,
    sub_num: app.globalData.sub_num,
    fans_num: app.globalData.fans_num,
    coll_data: null,
    img_data: null,
    img_temp_urls_list: [],
    real_img_height_list: [],
    real_img_width_list: [],
    swiper_height: app.globalData.system.windowHeight * 0.4,
    last_img_index: 0,
    user: null,
    enter_time: 0
  },

  onLoad: function (options) {
    let self = this;
    wx.showLoading({
      title: '加载中',
    })
    // 防止用户在用户数据没加载好时点击
    if (!app.globalData.cry_id){
      wx.cloud.callFunction({
        name: 'login',
        success(res) {
          app.globalData.cry_id = md5(res.result.openid)
          self.init_user_info()
        }
      })
    }else{
      self.init_user_info() // 加载用户数据
    }

    if (!app.globalData.userInfo){
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          self.setData({
            userinfo: app.globalData.userInfo,
            height: app.globalData.system.screenHeight - 50
          })
        }
      })
    }else{
      self.setData({
        userinfo: app.globalData.userInfo,
        height: app.globalData.system.screenHeight - 50
      })
    }

    console.log(self.data.userinfo)
    self.download_img()
    
  },

  onShow() {
    let self = this
    self.setData({
      sub_num: app.globalData.sub_num,
      fans_num: app.globalData.fans_num
    })
    if (self.data.enter_time)
      self.init_user_info()
  },

  onHide() {
    let self = this
    clearInterval(self.data.timer)
  },

  onReady() {
    const lineAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    const canvasAni = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
    })
    this.canvasAni = canvasAni
    this.lineAni = lineAni
  },

  onShareAppMessage(res){
    console.log(rse)
    if(res.from === 'button'){
      // 来自页面内的转发按钮
      return {
        title: '来看看我的作品吧',
        path: '../index/index'
      }
    }
  },

  setImgHeight(){
    let self = this, d = this.data;
    let rowImgWidth = [],
        tempRealImgHeight = [],
        tempRealImgWidth = []
    let tempImgWidth = 0,
        tempImg = [];
    let minRadio = 0,
        count = 0,
        swiperHeight = 0,
        minIndex = 0;
    let old_index = 0;
    let restWidth = 0;
    let itemGetWidth = 0;
    let last_index;
    const imgItemHeight = d.system.windowHeight * 0.2
    // 大盒子宽度 has_img_boxWidth
    // 所有图片的高度 temp_img_height_list
    // 所有图片的宽高比 img_ratio_list
    // 计算宽度
    // console.log(img_ratio_list)
    img_ratio_list.forEach((item)=>{
      rowImgWidth.push(item * imgItemHeight)
    })
    // console.log('rowImgWidth')
    // console.log(rowImgWidth)
    rowImgWidth.forEach((item, index) => {
      if (count < 3) {
        tempImgWidth += (item + 10)  // 10px为外边距
        tempImg.push(item + 10)
        // 获取最小宽高比
        if (minRadio) {
          minRadio = img_ratio_list[index] > minRadio ? img_ratio_list[index] : minRadio
        } else {
          minRadio = img_ratio_list[index]
        }
        // img_ratio_list.slice(old_index, index + 1).forEach((item) =>{
        //   console.log(item)
        //   if (minRadio <)
        // })
        // console.log(minRadio)
        // 当图片的宽度大于容器的宽度，把当前的图片塞到下一行
        if (tempImgWidth > has_img_boxWidth) {
          count++;

          // 当前行的图片宽度小于盒子宽度的一般
          if ((tempImgWidth - (item + 10)) <= (has_img_boxWidth / 2)) {
            // 加入下张图片， 宽度固定为has_img_boxWidth - tempImgWidth - 10
            let nextImgWidth = has_img_boxWidth - tempImgWidth + (item + 10)
            restWidth = 0
            itemGetWidth = 0
            tempImg[tempImg.length - 1] = nextImgWidth
          } else {
            tempImgWidth -= (item + 10)
            tempImg.pop(item + 10)
            //  剩余宽度 用于拉伸
            restWidth = has_img_boxWidth - tempImgWidth
            // 每个图片分到的宽度
            itemGetWidth = restWidth / tempImg.length
          }
          // 取最小宽高比的图片为标准进行高度拉伸
          let t = 0;
          tempImg.forEach((_item, i) => {
            if (i == 0) {
              t = _item
            }
            if ((1 / (minRadio / (itemGetWidth + (t - 10)))) < (imgItemHeight)){
              tempRealImgHeight.push(imgItemHeight)
            }else{
              tempRealImgHeight.push(1 / (minRadio / (itemGetWidth + (t - 10))))
            }
            tempRealImgWidth.push((itemGetWidth + (_item - 10)))
          })
          if ((1 / (minRadio / (itemGetWidth + (t - 10)))) < (imgItemHeight)) {
            swiperHeight += (imgItemHeight + 10)
          }else{
            swiperHeight += (1 / (minRadio / (itemGetWidth + t)) + 10)
          }

          if ((tempImgWidth - (item + 10)) <= (has_img_boxWidth / 2)){
            minRadio = img_ratio_list[index];
            tempImg = []
            tempImgWidth = 0
          }
          else{
            minRadio = 0;
            tempImg = [(item + 10)]
            tempImgWidth = (item + 10)
          }
          // console.log(minRadio)
        }

        if(count == 2){
          last_index = index
        }
      }
    })
    

    self.setData({
      real_img_height_list: tempRealImgHeight,
      swiper_height: swiperHeight - 20,
      real_img_width_list: tempRealImgWidth,
      last_img_index: last_index
    })
    // console.log('real img height')
    // console.log(d.real_img_height_list)
  },

  goProduct(e){
    wx.navigateTo({
      url: '../product/product?current='+e.currentTarget.dataset.current,
    })
  },


  // 下载canvas中的网络图片
  download_img(){
    let self = this, d = self.data;
    // console.log(d.userinfo.avatarUrl)
    // 下载头像
    wx.downloadFile({
      url: d.userinfo.avatarUrl,
      success(res){
        if (res.statusCode === 200){
          download_logo = res.tempFilePath
        }
      }
    })
    // 下载背景
    wx.downloadFile({
      url: d.draw_img_urls.bg,
      success(res) {
        if (res.statusCode === 200) {
          download_bg = res.tempFilePath 
        }
      }
    })
    // 下载二维码
    wx.downloadFile({
      url: d.draw_img_urls.qr,
      success(res) {
        if (res.statusCode === 200) {
          download_qr = res.tempFilePath 
        }
      }
    })
  },
  // 获取下载好的图片的信息并生成canvas
  saveImage(){
    let self = this, d = self.data;
    const {windowWidth, windowHeight} = d.system
    console.log(windowWidth, windowHeight)
    let canvasWidth = windowWidth * 0.86, 
      canvasHeight = windowHeight * 0.76
    let promise_1 = new Promise(function(resolve, reject){
      wx.getImageInfo({
        src: download_logo,
        success(res){
          resolve(res)
        }
      })
    })
    let promise_2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: download_bg,
        success(res) {
          resolve(res)
        }
      })
    })
    let promise_3 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: download_qr,
        success(res) {
          resolve(res)
        }
      })
    })
    // 全部信息获取成功
    Promise.all([
      promise_1, promise_2, promise_3
    ]).then(res =>{
      wx.showLoading({
        title: '海报生成中...',
      })
      let cavas_famous = famous[Math.floor(Math.random() * famous.length)]
      let famous_list = cavas_famous.split('，')
      let famous_name = famous_list[famous_list.length - 1].split('——')[1]
      famous_list[famous_list.length - 1] = famous_list[famous_list.length - 1].split('——')[0]
      famous_list.push(famous_name)
      let date = new Date(),
          day = date.toString().split(" ")[2],
          month = date.toString().split(" ")[1];
      console.log(cavas_famous, day, month)
      let canvas = wx.createCanvasContext('share_canvas')
      // 画背景图
      canvas.drawImage(res[1].path, 0, 0, canvasWidth, canvasHeight);
      canvas.save()
      // 底部阴影背景
      canvas.setGlobalAlpha(0.2)
      canvas.setFillStyle('#000')
      canvas.fillRect(0, canvasHeight - self.to_px(300), canvasWidth, self.to_px(300))
      
      // 绘制头像
      canvas.setGlobalAlpha(1)
      canvas.beginPath()
      canvas.arc(self.to_px(74), canvasHeight - self.to_px(280-54), self.to_px(54), 0, 2 * Math.PI)
      canvas.clip()
      canvas.drawImage(res[0].path, self.to_px(20), canvasHeight - self.to_px(280), self.to_px(108), self.to_px(108));
      canvas.restore()

      // 绘制日期
      canvas.setFontSize(self.to_px(72))
      canvas.setGlobalAlpha(1)
      canvas.setFillStyle('#fff')
      canvas.fillText(day, self.to_px(20), (self.to_px(72)+20))
      canvas.setFontSize(self.to_px(44))
      canvas.fillText(month, self.to_px(108), (self.to_px(72) + 20))
      // 绘制名言
      canvas.setFontSize(self.to_px(32))
      famous_list.forEach((item, index)=>{
        if (index == (famous_list.length-1)){
          canvas.fillRect(self.to_px(20), (self.to_px(72 * (index + 2))), self.to_px(60), self.to_px(10))
          canvas.fillText(item, self.to_px(20), (self.to_px(72 * (index + 2)) + 30), canvasWidth - self.to_px(20))
        }else{
          canvas.fillText((index != famous_list.length - 2 ? item + '，' : item), self.to_px(20), index == 0 ? self.to_px(72 * (index + 2)) + 20 : self.to_px(64 * (index + 2)) + 20, canvasWidth - self.to_px(20))
        }
      })
      canvas.setFontSize(self.to_px(32))
      // 绘制用户句子
      canvas.fillText(`${d.userinfo.nickName}在`, self.to_px(20+150), canvasHeight - self.to_px(240), canvasWidth-20)
      canvas.fillText((d.user.school == '设置你的高校') ? '棱影校园摄影社区' : `${d.user.school}`, self.to_px(20 + 150), canvasHeight - self.to_px(190), canvasWidth - 20)
      // 绘制产品标语
      canvas.fillText('将你眼前的艺术，', self.to_px(20), canvasHeight - self.to_px(105))
      canvas.fillText('变成我们心中的世界。', self.to_px(20), canvasHeight - self.to_px(65))
      canvas.fillText('一 棱影', canvasWidth - self.to_px(280), canvasHeight - self.to_px(30))
      // 绘制二维码
      canvas.drawImage(res[2].path, canvasWidth - self.to_px(148), canvasHeight - self.to_px(150), self.to_px(128), self.to_px(128));
      canvas.draw()

      let timeout = setTimeout(()=>{
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          destWidth: canvasWidth * 3,
          destHeight: canvasHeight * 3,
          canvasId: 'share_canvas',
          success(res){
            self.setData({ canvas_img_url: res.tempFilePath})
            wx.hideLoading()
            console.log(d.canvas_img_url)
            clearTimeout(timeout)
          }
        })
      }, 500)
    })
  },

  //保存至相册
  save_to_album(){
    let self = this, d = self.data;
    wx.getSetting({
      success(res) {
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              self.save_to_album();
            },
            fail() {
              // 如果用户拒绝过或没有授权，则再次打开授权窗口
              // （ps：微信api又改了现在只能通过button才能打开授权设置，以前通过openSet就可打开，下面有打开授权的button弹窗代码）
              wx.showModal({
                title: '获取权限失败',
                content: '是否打开设置页，允许小程序保存图片到你的相册',
                success: () => {
                  wx.openSetting({
                    success(sRes) {
                      if (sRes.authSetting['scope.writePhotosAlbum']) {
                        setTimeout(() => {
                          self.save_to_album();
                        }, 200);
                      }
                    },
                  });
                },
              });
            },
          });
        } else {
          // 有则直接保存
          wx.showLoading({
            title: '正在保存',
          })
          wx.saveImageToPhotosAlbum({
            filePath: d.canvas_img_url,
            success(res){
              wx.hideLoading()
              wx.showModal({
                title: '保存成功',
                content: '快去分享图片到朋友圈吧~',
                showCancel: false,
                confirmText: '好的',
                success(res){
                  if(res.confirm){
                    self.hide_canvas()
                  }
                }
              })
            }
          })
        }
      },
    })
  },

  to_rpx(px){
    let self = this;
    return px / self.data.system.windowWidth * 750
  },

  to_px(rx) {
    let self = this;
    return rx / 750 * self.data.system.windowWidth
  },

  hide_canvas(){
    let self = this, d = self.data;
    this.canvasAni.translateX(0).step()
    this.setData({canvasAniData: this.canvasAni.export()})
  },

  show_canvas(){
    let self = this, d = self.data;
    this.canvasAni.translateX(d.system.windowWidth).step()
    this.setData({ canvasAniData: this.canvasAni.export(), actionSheetHidden: true})
    self.saveImage()
  },


  action_sheet(e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  init_user_info() {
    let self = this, d = self.data;
    wx.request({
      url: `${urls.get_info_user}?uid=${app.globalData.cry_id}`,
      success(e) {
        app.globalData.lengying_userinfo = e.data.user
        self.setData({
          user: e.data.user,
          enter_time: 1,
        })
        if (e.data.user.cover_img.indexOf('https') != -1) {
          self.setData({ cover_img: e.data.user.cover_img })
        } else {
          self.init_cover_img(e.data.user.cover_img)
        }
        console.log(e)
          // 获取图片的cloud_id
          if (e.data.imgs.length != 0){
            let temp_img_id_list = [];
            e.data.imgs.forEach((item) => {
              temp_img_id_list.push(item.iid)
              img_ratio_list.push(item.width / item.height)
              temp_img_height_list.push(item.height)
            })
            wx.cloud.getTempFileURL({
              fileList: temp_img_id_list,
              success: res => {
                res.fileList.forEach((f_item, f_index)=>{
                  e.data.imgs[f_index].tempFileURL = f_item.tempFileURL
                })
                self.setData({ img_data: e.data.imgs.length ? e.data.imgs : null })
                console.log(d.img_data)
                // 获取has_img容器的宽度
                if (d.img_data.length) {
                  wx.createSelectorQuery().select('.has_img').boundingClientRect((res) => {
                    has_img_boxWidth = res.width
                    self.setImgHeight()
                  }).exec()
                }
              },
              fail: console.error
            })
          }
          
          if (e.data.colls.length){
            // 获取影集中预览图片中的cloud_id
            let temp_coll_id_list = [];
            let temp_coll_index_list = [];
            e.data.colls.forEach((item, index) => {
              if (item.priview_photo.indexOf('lengying') != -1) {
                // 如果是云存储的内容
                temp_coll_id_list.push(item.priview_photo.split('_').join('.'))
                temp_coll_index_list.push(index)
              }
            })
            console.log(temp_coll_index_list)

            wx.cloud.getTempFileURL({
              fileList: temp_coll_id_list,
              success: res => {
                res.fileList.forEach((item, index) => {
                  e.data.colls[temp_coll_index_list[index]].priview_photo = item.tempFileURL
                })
                self.setData({ coll_data: e.data.colls.length ? e.data.colls : null})
              },
              fail: console.error
            })
          }
        wx.hideLoading()
      }
    })
  },

  init_cover_img(cover_img_id) {
    let self = this;
    let path = wx.getStorageSync('cover_img');
    if (path.length != 0) {
      self.setData({ cover_img: path })
    } else {
      wx.cloud.getTempFileURL({
        fileList: [cover_img_id],
        success: res => {
          self.setData({ cover_img: res.fileList[0].tempFileURL })
          wx.setStorage({
            key: 'cover_img',
            data: res.fileList[0].tempFileURL,
          })
        },
        fail: err => {}
      })
    }
  },

  action_sheet(e){
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },

  change_backimg: function (e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res.tempFilePaths)
        wx.navigateTo({
          url: './chooseBackground/chooseBackground?url=' + res.tempFilePaths[0],
        })
      }
    })
  },

  goEdit(){
    wx.navigateTo({
      url: './editInfo/editInfo',
    })
  },

  prewAvater: function(e){
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  },

  tap_change: function (e) {
    let self = this, d = self.data;
    self.setData({
      current: parseInt(e.currentTarget.dataset.current)
    })
  },

  go_edit(){
    wx.navigateTo({
      url: './editInfo/editInfo',
    })
  },


  change_page: function(e){
    let self = this, d = self.data;
    let n_current = e.detail.current
    self.setData({
      current: n_current,
    })
  },

  go_feedback: function(){
    wx.navigateTo({
      url: './feedback/feedback',
    })
  },

  go_contact: function () {
    wx.navigateTo({
      url: './contact/contact',
    })
  },

  go_support: function () {
    wx.navigateTo({
      url: './support/support',
    })
  },

  go_help: function () {
    wx.navigateTo({
      url: './help/help',
    })
  },

  goFollow(e){
    let type = e.currentTarget.dataset.type
    let id = app.globalData.cry_id
    if(type == 'g'){
      wx.navigateTo({
        url: `./follow/follow?uid=${id}&title=${"我的关注"}`,
      })
    }  
    else if (type == 'f'){
      wx.navigateTo({
        url: `./fans/fans?uid=${id}&title=${"我的粉丝"}`,
      })
    }
    else{
      wx.navigateTo({
        url: `./like/like?uid=${id}&title=${"我喜欢的"}`,
      })
    }
  },

  change_to_0: function(){
    let self = this;
    self.setData({current: 0})
  },

  change_to_1: function () {
    let self = this;
    self.setData({ current: 1 })
  },

  go_detailColl(e){
    app.globalData.temp_coll_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../search/detail_coll/detail_coll`,
    })
  },

  previewImg: function (e) {
    let self = this;
    app.globalData.preview_img_data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `../preview/preview`
    })
  },
})