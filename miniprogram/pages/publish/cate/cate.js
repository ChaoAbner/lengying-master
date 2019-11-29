// pages/publish/cate/cate.js
const app = getApp();
let all_cate_list = [
  '未分类' ,'中国风', '创意', '美食', '艺术', '人物', '流行', '纹理', '风景', '现在的事', '建筑', '工作', '动物', '旅行', '神圣', '健康', '壁纸', 
  
  '城市', '交通', '名胜', '夜景', '婚礼', '航拍', '静物', '音乐', '黑白'
]

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '分类', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    header_height: app.globalData.nav_bar_height - app.globalData.system.statusBarHeight,
    system: app.globalData.system,
    cate_list: all_cate_list,
    choose: null
  },

 
  onLoad: function (options) {
    let self = this, d = self.data;
    self.setData({ choose: options.choose_cate})
  },
  finish_choose: e=>{
    let choose = e.currentTarget.dataset.item
    let pages = getCurrentPages()
    let last_page = pages[pages.length - 2]
    last_page.setData({
      choose_cate: choose
    })
    wx.navigateBack({
      delta: 1
    })
  }

})