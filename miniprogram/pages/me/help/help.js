// pages/me/help/help.js
const app = getApp()
Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '帮助', //导航栏 中间的标题
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.nav_bar_height,
    question: [
      "棱影面向哪些人群?",
      "我在棱影可以做些什么？",
      "校园风采是什么？",
      // "流浪卡片怎么玩？",
      "影集有什么用，如何定制明信片？",
      "在棱影可以盈利吗？",
      "怎么让大家认识我？",
    ]
  },

  go_detail(e){
    wx.navigateTo({
      url: `./detail/detail?q=${e.currentTarget.dataset.q}`,
    })
  }

})