// pages/message/talk/talk.js
const app = getApp()
const urls = require('../../../utils/config.js').urls

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: null, //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    isShow: false,//控制emoji表情是否显示
    isLoad: true,//解决初试加载时emoji动画执行一次
    isLoading: true,//是否显示加载数据提示
    disabled: true,
    system_type: app.globalData.system_type,
    cfBg: false,
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    flag: true,//加号的控制打开/关闭
    sendflag: false,
    userInfo: null,//用户信息，用于头像显示
    toUserInfo: null,
    feedback: [],//返回数据
    minutes: '',//分钟间隔
    addinput: '',//清楚input框的值
    addtell: {
      addtellHidden: true,//弹出框显示/隐藏
    },
    notifyData: null,
    inputButtom: 0,
    notify_index: -1
  },

  onLoad(options){
    let self = this, d = self.data;
    console.log(options.index, typeof(options.index))
    if (typeof (options.index) === 'string' && options.index !== undefined)
      self.setData({
        notify_index: parseInt(options.index) 
      })
    console.log(d.notify_index, typeof (d.notify_index))
    self.initNotify(options.target_id, options.is_read)
  },

  initNotify(target_id, is_read){
    let self = this, d = self.data;
    let newFeedback = d.feedback
    console.log(app.globalData.notifyData)
    // 初始化两个用户的聊天记录
    wx.request({
      url: `${urls.get_talk_record}?uid=${app.globalData.cry_id}&talkToUid=${target_id}&is_read=${is_read}`,
      success(res){
        console.log(res.data && typeof (res.data) == 'object')
        res.data.forEach((item)=>{
          if (item.notify_id == 1){
            item.content = app.globalData.userInfo.nickName + item.content
          }
          item.create_at = item.create_at.split('T')[0].split('-').join("/") + " " + item.create_at.split('T')[1].split('.')[0].split(':')[0] + ':' + item.create_at.split('T')[1].split('.')[0].split(':')[1]
          item.role = item.sender.uid == app.globalData.cry_id ? true : false
        })
        newFeedback = res.data
        self.setData({
          userInfo: app.globalData.userInfo,
          toUserInfo: app.globalData.talkToUserInfo,
          ['nvabarData.title']: app.globalData.talkToUserInfo.username,
          feedback: newFeedback,
        })
      }
    })
  },

  onShow: function () {
    // 页面显示
    //将全局的方法赋值
    var that = this;
  },

  bindfocus: function (e) {
    // console.log(e.detail.height)
    //当sendflag有值的时候，设置发送按钮显示
    this.setData({
      sendflag: true,
      inputButtom: e.detail.height
    })
    var that = this;
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType == 'fail') {
          wx.showToast({
            title: '当前网络不可用',
            icon: 'loading',
            duration: 10000
          })
        } else {
          wx.hideToast()
        }
        that.setData({
          networkType: res.networkType// 返回网络类型2g，3g，4g，wifi
        })
      }
    })
    // console.log(this.data.inputButtom)
  },

  bindblur: function (e){
    console.log(e)
    var that = this;
    this.setData({
      sendflag: false,
      inputButtom: 0,
      addinput: e.detail.value
    })

    // console.log(this.data.inputButtom)
  },

  doSend(){
    var that = this;
    //提交输入框的数据
    if (that.data.addinput != '') {
      //获取当前时间
      var myDate = new Date();
      var hours = myDate.getHours();       //获取当前小时数(0-23)
      var minutes = myDate.getMinutes();     //获取当前分钟数(0-59)
      //如果两次时间
      if (minutes == this.data.minutes) {
        var mydata = ''
      } else {
        var mydata = hours + ':' + (minutes < 10 ? `0${minutes}` : minutes)
      }

      //消息数组，系统默认
      var newfeedback = this.data.feedback;
      newfeedback.push({
        content: that.data.addinput,
        content_type: 0,
        create_at: mydata,
        role: true,
      })


      // 上传文字到服务器，添加消息记录
      let data = {
        uid: app.globalData.cry_id,
        talkToUid: that.data.toUserInfo.uid,
        content: that.data.addinput
      }
      that.pushNotify(data)

      
      // 修改message页面的content数据
      if (that.data.notify_index >= 0){
        let pages = getCurrentPages()
        let last_page = pages[pages.length - 2]
        console.log(that.data.notify_index)
        let mess = `notifyData.announce[${that.data.notify_index}].notify.content`
        last_page.setData({
          [mess]: that.data.addinput
        })
        console.log(last_page.data.notifyData)
      }
      else{
        let addNotifyFlag = 0
        // 如果当前globalData的消息私信中没有与这个人的聊天记录，则添加记录
        app.globalData.notifyData.forEach((item) => {
          if (item.sender.uid === that.data.toUserInfo.uid)
            addNotifyFlag = 1
        })
        if (!addNotifyFlag) {
          let tempNotify = {},
            date = new Date(),
          // "2019-05-01T21:50:57.162"
            timeString = date.toTimeString(),
            dateString = date.toLocaleDateString();
          let create_at_1 = dateString.split('/')[1] + '/' + dateString.split('/')[2] 
          let create_at_2 = timeString.split(' ')[0].split(':')[0] + ":" + timeString.split(' ')[0].split(':')[1]
          tempNotify.is_read = true
          tempNotify.create_at = `${create_at_1} ${create_at_2}`
          tempNotify.rule = 'announce'
          
          tempNotify.notify = {
            content: that.data.addinput,
            create_at: `${create_at_1} ${create_at_2}`,
            rule: 'announce'
          }
          tempNotify.sender = that.data.toUserInfo

          app.globalData.notifyData.push(tempNotify)
        }
      // 如果有记录，更新message的该条信息的显示信息
      }

      // 添加消息记录缓存
      wx.setStorage({
        key: `announce_${app.globalData.talkToUserInfo.uid}`,
        data: that.data.addinput
      })

      //修改feedback,设置addinput为[]值为空
      that.setData({
        addinput: [],
        minutes: minutes,
        feedback: newfeedback,
      })
    }
  },

  pushNotify(data){
    wx.request({
      url: `${urls.get_talk_record}`,
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
      data: data,
      success(res){
        console.log(res)
      }
    })
  },

  bindtapimg: function () {
    //打开添加图片框
    this.setData({
      flag: false
    })
  },

  closeimg: function () {
    //闭合添加图片框
    this.setData({
      flag: true
    })
  },

  go_userpage(e){
    app.globalData.userpage_data = e.currentTarget.dataset.item
    console.log(app.globalData.userpage_data )
    if (e.currentTarget.dataset.item.cover_img){
      wx.navigateTo({
        url: '../../userpage/userpage_real/userpage_real',
      })
    }
  }
})