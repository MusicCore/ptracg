// pages/musicdetail/musicdetail.js
var WxParse = require('../../static/wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id : 0,
    music : {},
    cmtList : {},
    musicHtml : "",
    isFav : null,
    token : "",
    btn_disable: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let token_temp = wx.getStorageSync('token').data
    if (token_temp != null){
      this.setData({
        token: token_temp
      })
    }
    this.setData({
      id: options.id
    })
    this.getMusicDetail(this.data.id)
  },

  getMusicDetail: function(id){
    const that = this
    let reqUrl = app.globalData.URL + '/api/weixin/musicdetail'
    let data = {
      id: id
    }
    app.wxRequest('GET', reqUrl, data, (res) => {
      console.log(res.data.isFav)
      that.setData({
        music: res.data.music,
        cmtList: res.data.cmtList,
        isFav: res.data.isFav
      })
      console.log("th:"+that.data.isFav)
      WxParse.wxParse('musicHtml', 'html', res.data.music.content, that, 5)
    },(err) =>{

    })
  },

  addFav: function(){
    const that = this
    let reqUrl = app.globalData.URL + '/api/weixin/fav/link'
    let data = {
      id: that.data.id
    }
    that.changeBtn(true)
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.showToast({
        title: '已完成',
        icon: 'success',
        duration: 1500
      });
      that.onLoad(data)
    }, (err) => {
      that.changeBtn(false)
    })
  },

  delFav: function () {
    const that = this
    let reqUrl = app.globalData.URL + '/api/weixin/favorites/remove'
    let data = {
      id: that.data.id
    }
    that.changeBtn(true)
    app.wxRequest('GET', reqUrl, data, (res) => {
      wx.showToast({
        title: '已完成',
        icon: 'success',
        duration: 3000
      });
      that.onLoad(data)
    }, (err) => {
      that.changeBtn(false)
    })
  },

  changeBtn:function(suc) {
    this.setData({
      btn_disable: suc
    })
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
    let dat ={
      id: this.data.id
    }
    this.onLoad(dat)
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})