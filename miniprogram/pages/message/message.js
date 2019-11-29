// pages/message/message.js
const app = getApp();
const urls = require('../../utils/config.js').urls
import md5 from '../../utils/md5.js'

let tempNotifyData = {
  "like": [],
  "comment": [],
  "subscribe": [],
  "upload": [],
  "fans": [],
  "work": [],
  "announce": []
}

let unReadNotifyLength = {
  'like': 0,
  'comment': 0,
  'subscribe': 0,
  'upload': 0,
  'fans': 0,
  'work': 0,
  'announce': {},
}

Page({
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标   1表示显示    0表示不显示
      title: '消息', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    data_list: [],
    notifyData: null,
    userinfo: null,
    notifyLength: null,
    enter_num: 0
  },

  onLoad(){
    let self = this
    self.setData({ userinfo: app.globalData.userInfo})
    self.initNotifyData()
  },

  onShow(){
    let self = this
    if(self.data.enter_num){
      self.setData({ notifyData: app.globalData.notifyData })
      self.notifyHandle()
    }
  },

  requestNofity(){
    let self = this
    wx.request({
      url: `${urls.get_notify}?uid=${app.globalData.cry_id}`,
      success(res) {
        console.log(res)
        app.globalData.notifyData = res.data
        let i;
        for (i = 0; i < res.data.length; i++) {
          if (!res.data[i].is_read) {
            wx.showTabBarRedDot({
              index: 3,
              success() { console.log('有新的消息') }
            })
            break;
          }
        }
        self.notifyHandle()
      }
    })
  },

  getNotify(){
    let self = this
    if (!app.globalData.cry_id){
      wx.cloud.callFunction({
        name: 'login',
        success(res) {
          app.globalData.cry_id = md5(res.result.openid)
          self.requestNofity()
        }
      })
    }
      
    else { self.requestNofity()}
  },

  notifyHandle(){
    let self = this
    let exitSender = []
    let recode;
    let datetime = new Date()
    let tempAppNotifyData = []
    tempAppNotifyData = app.globalData.notifyData
    // console.log('tempAppNotifyData')
    // console.log(tempAppNotifyData)
    tempAppNotifyData.forEach((item, index) => {
      if(!self.data.enter_num){
        let item_year = parseInt(item.create_at.split('-')[0]),
          item_month = parseInt(item.create_at.split('-')[1]),
          item_day = parseInt(item.create_at.split('T')[0].split('-')[2])
        if (datetime.getDate() == item_day && (datetime.getMonth() + 1) == item.item_month && datetime.getFullYear() == item_year) {
          item.create_at = item.create_at.split('T')[1].split('.')[0].split(':')[0] + ':' +
            item.create_at.split('T')[1].split('.')[0].split(':')[1]
        }
        else {
          item.create_at = item_month + "/" + item_day + " " + item.create_at.split('T')[1].split('.')[0].split(':')[0] + ':' +
            item.create_at.split('T')[1].split('.')[0].split(':')[1]
        }
      }

      switch (item.notify.rule) {
        case "announce": {
          // 设置未读消息的长度
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.announce[item.notify.sender_id] ?
              unReadNotifyLength.announce[item.notify.sender_id] += 1 :
              unReadNotifyLength.announce[item.notify.sender_id] = 1;
          }
          if (tempNotifyData.announce.length !== 0) {
            if (exitSender.indexOf(item.notify.sender_id) == -1 && item.sender.uid !== app.globalData.cry_id) {
              tempNotifyData.announce.push(item)
              exitSender.push(item.notify.sender_id)
            } else {
              tempNotifyData.announce[exitSender.indexOf(item.notify.sender_id)] = item
            }
          }
          else {
            tempNotifyData.announce.push(item)
            exitSender.push(item.notify.sender_id)
          }
        }; break;
        case "like": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.like += 1;
          }
          tempNotifyData.like.push(item);
        } break;
        case "comment": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.comment += 1;
          }
          tempNotifyData.comment.push(item);
        } break;
        case "subscribe": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.subscribe += 1;
          }
          tempNotifyData.subscribe.push(item);
        } break;
        case "fans": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.fans += 1;
          }
          tempNotifyData.fans.push(item);
        } break;
        case "upload": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.upload += 1;
          }
          tempNotifyData.upload.push(item);
        } break;
        case "work": {
          if (!item.is_read && !self.data.enter_num) {
            unReadNotifyLength.work += 1;
          }
          tempNotifyData.work.push(item);
        } break;
      }
    })

    if (JSON.stringify(unReadNotifyLength.announce) == "{}")
      unReadNotifyLength.announce = 0

    // 设置最新的消息内容
    tempNotifyData.announce.forEach((item, index) => {
      if (item.is_read) {
        recode = wx.getStorageSync(`announce_${item.sender.uid}`)
        if (recode)
          item.notify.content = recode
      } else {
        wx.setStorage({
          key: `announce_${item.sender.uid}`,
          data: item.notify.content
        })
      }
    })
    // console.log(tempNotifyData)
    // console.log(unReadNotifyLength)

    self.setData({
      notifyData: tempNotifyData,
      notifyLength: unReadNotifyLength,
      enter_num: 1
    })

    tempNotifyData = {
      "like": [],
      "comment": [],
      "subscribe": [],
      "upload": [],
      "fans": [],
      "work": [],
      "announce": []
    }
  },

  initNotifyData(){
    let self = this, d = self.data;
    if(!app.globalData.notifyData)
      self.getNotify()
    else { 
      console.log('handle')
      self.notifyHandle()
    }
  },

  goMessage(e){
    console.log(e.currentTarget.dataset.type)
    let self = this;
    let type = e.currentTarget.dataset.type
    switch(type){
      case 'like': {
        self.setData({
          ['notifyLength.like']: 0
        })
        self.navigatePage('like');
      } break;
      case 'comment':{
        self.setData({
          ['notifyLength.comment']: 0
        })
        self.navigatePage('comment');
      }  break;
      case 'subscribe':{
        self.setData({
          ['notifyLength.subscribe']: 0
        })
        self.navigatePage('subscribe');
      }  break;
      case 'product':{
        self.setData({
          ['notifyLength.work']: 0
        })
        self.navigatePage('product');
      } break;
      case 'upload':{
        self.setData({
          ['notifyLength.upload']: 0
        })
        self.navigatePage('upload');
      } break;
    }
  },

  delDot(){
    let self = this, d = self.data
    let nl = d.notifyLength
    let notifyFlag = 0
    // 判断是否去掉小红点
    if (nl.announce !== 0){
      for (var i in nl.announce) {
        console.log(nl.announce[i])
        if (nl.announce[i])
          notifyFlag = 1
      }
    }
    if (!nl.like && !nl.comment && !nl.fans && !nl.upload && !nl.subscribe &&
        !nl.work && !notifyFlag){
          wx.hideTabBarRedDot({
            index: 3,
            success(e){console.log('红点去除')},
            fail(e){console.log(e)}
          })
      }
  },

  navigatePage(type){
    let self = this, d = self.data
    self.delDot()
    wx.navigateTo({
      url: `./${type}/${type}`,
    })
  },

  go_talk(e){
    let self = this, d = self.data;
    let is_read = 0
    let index = e.currentTarget.dataset.index
    if (d.notifyLength.announce[e.currentTarget.dataset.item.notify.sender_id])
      is_read = 1
    app.globalData.tempTalkItem = e.currentTarget.dataset.item
    app.globalData.talkToUserInfo = e.currentTarget.dataset.item.sender
    console.log(app.globalData.tempTalkItem, app.globalData.talkToUserInfo)
    let id = e.currentTarget.dataset.item.notify.sender_id
    self.setData({
      [`notifyLength.announce.${id}`]: 0,
    })
    self.delDot()
    wx.navigateTo({
      url: `./talk/talk?target_id=${app.globalData.talkToUserInfo.uid}&is_read=${is_read}&index=${index}`
    })
  },
})