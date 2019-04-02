// pages/favorite/favorite.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
    favList: {},
    login_btn: false,
    isLoading: null,
    page: 1,
    rows: 5,
    noMore: false,
    floorstatus: false
  },

  getToken: function () {
    var that = this
    wx.showLoading({
      title: '努力登录中',
    })
    that.setData({
      login_btn: true
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: userRes => {
                  // 可以将 res 发送给后台解码出 unionId
                  // let reqUrl = app.globalData.URL + '/api/weixin/decodeUserInfo'
                  // let data = {
                  //   code: code,
                  //   iv: userRes.iv,
                  //   encryptedData: userRes.encryptedData
                  // }
                  //设置的全局请求方法不知为何会导致token设置后 刷新失效
                  // app.wxRequest('GET', reqUrl, data, (res) => {
                  //   console.log(res)
                  //   console.log(res.code)
                  //   console.log(res.data)
                  //   if (res.code == 400) {
                  //     return false
                  //   }
                  //     wx.setStorageSync('token', res.data)
                  //     app.globalData.userInfo = userRes.userInfo
                  //     that.setData({
                  //       userInfo: userRes.userInfo,
                  //       hasUserInfo: true
                  //     })
                  // }, (err) => {

                  // })

                  wx.request({
                    url: app.globalData.URL + '/api/weixin/decodeUserInfo',
                    data: {
                      code: code,
                      iv: userRes.iv,
                      encryptedData: userRes.encryptedData
                    },
                    header: {},
                    method: 'GET',
                    dataType: 'json',
                    responseType: 'text',
                    success: function (res) {
                      //将token设置在本地 str
                      if (400 == res.data.code) {
                        that.setData({
                          login_btn: false
                        })
                        return false
                      }
                      wx.setStorage({
                        key: 'token',
                        data: res.data,
                        success: function (res) {
                          //设置请求token后在本地后执行本地用户信息设置
                          wx.hideLoading()
                          app.globalData.userInfo = userRes.userInfo
                          that.setData({
                            userInfo: userRes.userInfo,
                            hasUserInfo: true
                          })
                          that.getFavList()
                        },
                        fail: function (res) { },
                        complete: function (res) { },
                      })
                      //将token设置在本地 over
                    },
                    fail: function (res) {
                      that.setData({
                        login_btn: false
                      })
                    },
                    complete: function (res) { },
                  })
                }
              })
            }
          }
        })
      }
    })
  },

  changeLoading: function (suc) {
    this.setData({
      isLoading: suc
    })
  },

  getFavList: function () {
    this.changeLoading(true)
    var that = this
    let reqUrl = app.globalData.URL + '/api/weixin/favorites/list'
    let data = {
      page: this.data.page,
      rows: this.data.rows
    }
    app.wxRequest('GET', reqUrl, data, (res) => {
      this.changeLoading(false)
      if (res.code == 400 || res.data.length == 0) {
        that.setData({
          noMore: true
        })
        return false
      }
      that.setData({
        favList: res.data.favlist,
        page: that.data.page + 1
      })
      wx.stopPullDownRefresh()
    }, (err) => {

    })
  },

  getMoreFavList: function () {
    wx.showLoading({
      title: '加载第' + this.data.page + '页数据',
    })
    var that = this
    let reqUrl = app.globalData.URL + '/api/weixin/favorites/list'
    let data = {
      page: this.data.page,
      rows: this.data.rows
    }
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.hideLoading()
      if (res.code == 400 || res.data.favlist.length == 0) {
        that.setData({
          noMore: true
        })
        return false
      }
      that.setData({
        favList: that.data.favList.concat(res.data.favlist),
        page: that.data.page + 1
      })
    }, (err) => {

    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.getFavList()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    if (e.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      favlist: {}
    })
    this.onLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.noMore){
    this.getMoreFavList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})