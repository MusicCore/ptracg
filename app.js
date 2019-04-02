//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // console.log(wx.getStorageSync('token').data == null) 
  },

  initHeader: function (method){
    let token_temp = wx.getStorageSync('token').data
    var header
    if (token_temp != null) {
      header = {
        'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'X-Token': token_temp
      }
    }else{
      header = {
        'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    }
    return header
  },

  globalData: {
    userInfo: null,
    isExpire: false,
    URL: "https://ptracg.com",
    token: null
  },

  tokenExpire: function () {
    this.setData({
      userInfo: null,
      token: null
    })
    wx.removeStorageSync('token')
  },

  /**
  * 封装wx.request请求
  * method： 请求方式
  * url: 请求地址
  * data： 要传递的参数
  * header:
  * callback： 请求成功回调函数
  * errFun： 请求失败回调函数
  **/
  wxRequest(method, url, data, callback, errFun) {
    wx.request({
      url: url,
      method: method,
      data: data,
      header: this.initHeader(method),
      dataType: 'json',
      success: function (res) {
        if (res.data.code == 50014){
          this.tokenExpire()
        }
        callback(res.data);
      },
      fail: function (err) {
        wx.showToast({
          title: '抱歉，请求超时！',
          icon: 'none',
          image: '',
          duration: 3000,
          success: function(res) {
            return false
          },
        })
        errFun(res);
      }
    })
  }
})