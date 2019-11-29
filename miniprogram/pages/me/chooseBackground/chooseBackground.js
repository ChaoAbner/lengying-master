// pages/me/chooseBackground/chooseBackground.js
const app = getApp();
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '更换背景图片', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
  },

  onLoad(e){
    console.log(e)
  }

})