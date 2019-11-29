// pages/search/community/community.js
const app = getApp()
const urls = require('../../../utils/config.js').urls
let timer;
let tagEle = [
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/563f6862e15c20a7fb67bb3787eb176.jpg?sign=a5b1ff81c87997f73476fd958c0e1a6a&t=1557902154'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/f39f5ddef2303e06a470424a3a953dc.jpg?sign=53d421cf122d32df7dab5372cb53776b&t=1557900849'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/ebe99d5ef6dade936021399b09637d1.jpg?sign=0eeb5f25f56d5e26d37312f72f503968&t=1557900868'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/7fbd0f043257bd99d925425fd2021d3.jpg?sign=48780e3ec30c349f694fe05e58d68c69&t=1557901753'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/e7cbc5f665efb8df0ae87bccf0b4686.jpg?sign=710995a2a27db895a6c44b4e6337a9b8&t=1557900878'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/da94728c150d69a1c48fd454f5e6160.jpg?sign=a21f359fce2925863e31824f5bf0576f&t=1557900885'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/da7b3e5db613e6ed24dadcbe6ee9a60.jpg?sign=d873e8c6fd902e8cfc288764868ba615&t=1557901734'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/da60f10cdff02b28aa8b78247c54c9b.jpg?sign=beb9d4173bed50537d4f5ebc401105fd&t=1557900902'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/cd02c58c1bdfaea9f7462001d6e2141.jpg?sign=2c3949dc441618fdc86ad5379bc71d17&t=1557900912'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/c646dcf42bbd1c2d9fd915549a1c7cd.jpg?sign=51590723d8f35e7d4723367a01046414&t=1557900921'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/bb90937c6b7a5d61cff129de0daf3f1.jpg?sign=ecdbee297bd711097730c04104b061e9&t=1557900929'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/b07362733de573446c0be567478e701.jpg?sign=e7249c6d2480db29a09a21ad51a7316a&t=1557900938'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/67720714594cf1acdd89418027ce045.jpg?sign=78ead487a8cbf96b7cfe9e27002f9f14&t=1557900946'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/864eafe1a984f8b03b9733b919a6469.jpg?sign=4e77e9b5fbe70668a716f67df7f17596&t=1557900957'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/46cae8da14d1dd9217b35b8653d7118.jpg?sign=774199424f6c6cc15175001bee4702f7&t=1557900964'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/7d93b448fd78b5fc2e9162358d5579a.jpg?sign=a6eafbebe030a6fc0dd8a577cf6512cf&t=1557900971'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/6a7f97a8bc45b88331980ca2341c859.jpg?sign=9c7d510a36c8fa40a49fd00a37509585&t=1557900978'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/8abec485f8aae6ddd4d73ec22bbda15.jpg?sign=c5f0a2c3f8a00ea63e41c750766f4d19&t=1557902166'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/06c3b7fa8ddd670a0257f755667e46e.jpg?sign=a96d29a023e6c73ff367e86ea158b96a&t=1557900994'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/5fe538ef17eee579ebb1336d84d1528.jpg?sign=0fb79d4c80f32ba69266c2d04ab5791e&t=1557901001'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/3b1f67403db45e1e3854f4f76d86ee1.jpg?sign=1b7cc1f4c688a32634f718deb928f238&t=1557901009'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/0ae453d5ce0a54cfea891b89a4806d1.jpg?sign=7c1ef63e81d620a4e07194e83fe70fd5&t=1557901016'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/00d02a5916bd785090098379cb5babe.jpg?sign=1c76f99c8b84318fc827080ab136fa2b&t=1557901022'
  },
  {
    x: 0,
    y: 0,
    z: 0,
    s: 0,
    o: 1,
    f: 15,
    angleX: 0,
    angleY: 0,
    img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/fd7b5c5fcc927b7c9e1fe855982b4a11_1557575157397.jpg?sign=85f292c4830d8f6ad48e5fc36e6736c1&t=1557901221'
  },
  // {
  //   x: 0,
  //   y: 0,
  //   z: 0,
  //   s: 0,
  //   o: 1,
  //   f: 15,
  //   angleX: 0,
  //   angleY: 0,
  //   img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/48ea2fa26a850efc8cea3d439e89b8a.jpg?sign=ea3d7ead797d9159a7cf5ae832d9e104&t=1557901239'
  // },
  // {
  //   x: 0,
  //   y: 0,
  //   z: 0,
  //   s: 0,
  //   o: 1,
  //   f: 15,
  //   angleX: 0,
  //   angleY: 0,
  //   img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/e433fa5ff74f40b68513d1d977cdede.jpg?sign=738269aa007912a2539a8b535ba5790f&t=1557901358'
  // },
  // {
  //   x: 0,
  //   y: 0,
  //   z: 0,
  //   s: 0,
  //   o: 1,
  //   f: 15,
  //   angleX: 0,
  //   angleY: 0,
  //   img: 'https://6c65-lengying-5889da-1258620266.tcb.qcloud.la/public/card/aa463270a9caf80088e72a0069e2f28.jpg?sign=0d39febb13ef92d5b4efbb910a44c30f&t=1557901366'
  // },
]

Page({

  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: 'we', //导航栏 中间的标题
      // 此页面 页面内容距最顶部的距离
    },
    height: app.globalData.nav_bar_height,
    system: app.globalData.system,
    tagEle: tagEle,
    interval: 50
  },

  onLoad: function (options) {
    // this.innit()
    if (!app.globalData.system_type) {
      this.setData({ interval: 300})
    }
  },

  onShow(){
    let self = this
    // if (!self.timer)
    this.innit()
  },

  onHide() {
    let self = this
    clearInterval(timer)
    // this.setData({
    //   timer: null
    // })
  },

  go_agreement() {
    wx.navigateTo({
      url: './push/agreement/agreement',
    })
  },

  go_mycard(){
    wx.navigateTo({
      url: './push/card/card',
    })
  },

  innit() {
    let self = this
    let windowWidth = app.globalData.system.windowWidth
    var fallLength, angleX, angleY, k, a, b, numx, numy, numz;
    for (var i = 0; i < tagEle.length; i++) {
      //圆的焦点
      fallLength = windowWidth / 2 
      angleX = Math.PI / fallLength
      angleY = Math.PI / fallLength
      k = (2 * (i + 1) - 1) / tagEle.length - 1;
      //计算按圆形旋转
      a = Math.acos(k);
      b = a * Math.sqrt(tagEle.length * Math.PI);
      //计算元素x，y坐标
      numx = windowWidth * 0.4 * Math.sin(a) * Math.cos(b)
      numy = windowWidth * 0.4 * Math.sin(a) * Math.sin(b);
      numz = windowWidth * 0.8 * Math.cos(a);

      // console.log(numo)
      //计算元素缩放大小
      tagEle[i].x = numx * 2
      tagEle[i].y = numy * 2
      tagEle[i].z = numz
      tagEle[i].s = 250 / (400 - tagEle[i].z)
    }
    //动画
    clearInterval(timer)

    timer = setInterval(() => {
      var a, numz, cos, sin, x1, y1, z1;
      var i;
      for (i = 0; i < tagEle.length; i++) {
        a = Math.acos(k);
        numz = 240 * Math.cos(a);
        tagEle[i].s = 250 / (400 - tagEle[i].z)
        cos = Math.cos(angleX);
        sin = Math.sin(angleX);
        y1 = tagEle[i].y * cos - tagEle[i].z * sin;
        z1 = tagEle[i].z * cos + tagEle[i].y * sin;
        tagEle[i].y = y1;
        tagEle[i].z = z1;

        cos = Math.cos(angleY);
        sin = Math.sin(angleY);
        x1 = tagEle[i].x * cos - tagEle[i].z * sin;
        z1 = tagEle[i].z * cos + tagEle[i].x * sin;
        tagEle[i].x = x1;
        tagEle[i].z = z1;
      }
      self.setData({
        tagEle: tagEle
      })
      if (!app.globalData.system_type)
        clearInterval(timer)
    }, self.data.interval)
  },



  back_navg(){
    wx.navigateBack({
      delta: 1
    })
  },

  doPush(){
    wx.navigateTo({
      url: './push/push',
    })
  },

  doExtracting(){
    
    wx.showLoading({
      title: '正在抽取卡片',
    })
    wx.request({
      url: `${urls.do_stray}?uid=${app.globalData.cry_id}`,
      success(res){
        console.log(res)
        if(res.data !== 'exist'){
          wx.hideLoading()
          wx.showModal({
            title: '抽取成功',
            content: '你已收留今日卡片，是否查看',
            success(e) {
              if (e.confirm) {
                wx.navigateTo({
                  url: './push/card/card',
                })
              }
            }
          })
        }
        else{
          wx.hideLoading()
          wx.showModal({
            title: '机会用完啦',
            content: '查看自己的卡片',
            success(e){
              if(e.confirm){
                wx.navigateTo({
                  url: './push/card/card',
                })
              }
            }
          })
        }
      }
    })
  },
    
})