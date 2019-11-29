

module.export = {
  to_preview: function nav_to_preview(e) {
    let self = this;
    const { color, created_at, likes, height, width } = e.currentTarget.dataset.item
    let url_ = e.currentTarget.dataset.item.urls.regular.split('/')[3].split('?')[0]
    let avater = e.currentTarget.dataset.item.user.profile_image.small.split('/')[3].split('?')[0]
    let username = e.currentTarget.dataset.item.user.username
    wx.navigateTo({
      url: `../preview/preview?url=${url_}&avater=${avater}&color=${color}&username=${username}&time=${created_at}&likes=${likes}&height=${height}&width=${width}`
    })
  },

  init_like_obj: function () {
    let self = this, d = self.data;
    let value = wx.getStorageSync('like')
    if (value) {
      temp_like_obj = value
      self.setData({ like_obj: temp_like_obj })
    } else {
      wx.request({
        url: `${urls.get_like}?id=${app.globalData.cry_id}`,
        success: res => {
          console.log(res)
          if (res.data == 'error') {
            temp_like_obj = {}
            self.setData({ like_obj: temp_like_obj })
          } else {
            temp_like_obj = res.data
            self.setData({ like_obj: temp_like_obj })
          }
        }
      })
    }
  },

  post_like_back_server: function (temp_like_obj) {
    console.log(app.globalData.cry_id, temp_like_obj)
    setTimeout(function () {
      let newData = {
        id: app.globalData.cry_id,
        data: JSON.stringify(temp_like_obj)
      }
      wx.request({
        url: urls.get_like,
        method: 'POST',
        data: newData,
        header: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
        success: res => {
          console.log(res)
        }
      })
    }, 2000)
  },
}
