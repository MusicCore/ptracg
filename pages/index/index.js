//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    musicList: {}, 
    inputShowed: false, //是否点击了搜索框
    inputVal: "", //搜索框的值
    isLoading: null,//是否正在载入初始数据
    page: 1,
    rows: 5,
    noMore: false, //没更多数据提示
    floorstatus: false, //滚动条监听显示按钮
    isSearch: false //是否正在进行搜索
  },

  onLoad: function() {
    this.getMusicScore(this.data.page,this.data.rows)
    // 用户使用登录后经过以下授权判断自动给全局用户信息赋值
    if (wx.getStorageSync('token').data != null) {
      this.isExpire()
    }
  },
  //下拉刷新页面
  onPullDownRefresh:function(){
    this.setData({
      page: 1,
      musicList: {},
      noMore: false, //没更多数据提示
      isSearch: false //是否正在进行搜索
    })
    this.onLoad()
  },

  changeLoading: function(suc) {
    this.setData({
      isLoading: suc
    })
  },

  isExpire: function() {
    var that = this
    app.wxRequest('GET', app.globalData.URL + '/api/weixin/verifytoken', '', (res) => {
      if (200 == res.code) {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  app.globalData.userInfo = res.userInfo
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                }
              })
            }
          }
        })
      }
      if (400 == res.code) {
        app.tokenExpire()
      }
    }, (err) => {
      app.tokenExpire()
    })
  },

  getMusicScore: function(page,rows) {
    let that = this
    let reqUrl = app.globalData.URL + '/music/musiclist'
    let data = {
      pageStart: page,
      rows: rows
    }
    that.changeLoading(true)
    app.wxRequest('GET', reqUrl, data, (res) => {
      that.setData({
        musicList: res.data,
        page: that.data.page+1
      })
      that.changeLoading(false)
      wx.stopPullDownRefresh()
    })
  },

  getMoreMusicScore: function (page, rows) {
    let that = this
    let reqUrl = app.globalData.URL + '/music/musiclist'
    let data = {
      pageStart: page,
      rows: rows
    }
    wx.showLoading({
      title: '加载第' + page +'页数据',
    })
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.hideLoading()
      if (res.data.length == 0 || res.code == 400){
       that.changeLoading(false)
        that.setData({
          noMore: true
        })
       return false
      }
      that.setData({
        musicList: that.data.musicList.concat(res.data),
        page: that.data.page + 1
      })
    })
  },

  //搜索条函数 str
  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function(e) {
    this.setData({
      inputVal: e.detail.value
    });
  }, 
  searchMusic: function(){
    var that = this 
    that.setData({//搜索进行初始化
      page: 1,
      isSearch: true
    })
    let pageSt = this.data.page
    wx.showLoading({
      title: '载入搜索第' + pageSt +'页数据',
    })
    console.log(this.data.inputVal)
    let reqUrl = app.globalData.URL + '/music/musicSRlist'
    let data = {
      pageStart: pageSt,
      rows: this.data.rows,
      title: this.data.inputVal
    }
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.hideLoading()
      if (res.data.length == 0 || res.code == 400) {
        that.setData({
          noMore: true
        })
        return false
      }
      that.setData({
        musicList: res.data,
        page: that.data.page + 1
      })
    })
  },

  searchMoreMusic: function () {
    var that = this
    let pageSt = this.data.page
    wx.showLoading({
      title: '载入搜索第' + pageSt + '页数据',
    })
    console.log(this.data.inputVal)
    let reqUrl = app.globalData.URL + '/music/musicSRlist'
    let data = {
      pageStart: pageSt,
      rows: this.data.rows,
      title: this.data.inputVal
    }
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.hideLoading()
      if (res.data.length == 0 || res.code == 400) {
        that.setData({
          noMore: true
        })
        return false
      }
      that.setData({
        musicList: that.data.musicList.concat(res.data),
        page: that.data.page + 1
      })
    })
  },
   //搜索条函数 over

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
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    if(!this.data.noMore && !this.data.isSearch){
      this.getMoreMusicScore(this.data.page, this.data.rows)
    } else if (!this.data.noMore){
      this.searchMoreMusic()
    }
  },
})