// pages/my/my.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userinfo:{},
    openid:""
  },
  //登录
  onGotUserInfo(e){ 
    const that = this
    wx.getUserProfile({
      desc:'登录',
      success:(res)=>{
        // debugger
        console.log(res);
        var userinfo = res.userInfo
        wx.cloud.callFunction({
          name:"login",
          success:res=>{
            that.setData({
              openid: res.result.openid,
              userinfo :userinfo
            })
            //保存在缓存中
            that.data.userinfo.openid = that.data.openid
            wx.setStorageSync('userinfo', that.data.userinfo)
            //在数据库中查找是否有userinfo（即查一下有没有这个用户）（查openid）
            wx.cloud.callFunction({
              name:"getUserInfo",
              //把userinfo传过去，如果有，就不用存入，没有就存入
              data:{
                userInfo:that.data.userinfo,
              }
            }).then(res=>{
              console.log(res)
              if (res.result.data.length==1){
                //在数据库内存在这个人的信息
                // 更新一下用户表的userinfo
                db.collection("user").doc(res.result.data[0]._id).update({
                  data:{
                    userInfo:that.data.userinfo
                  }
                })
                // 订阅服务（暂时没用到，与bindtap相关）
                wx.requestSubscribeMessage({
                  tmplIds: ['C040GvoJw03_WyTgGb1LyA5evqo39M5huSlIVHcuiUQ'],
                  success(res){
                    wx.setStorageSync('dateWarnKey', "C040GvoJw03_WyTgGb1LyA5evqo39M5huSlIVHcuiUQ")
                  },
                  fail(err){
                    console.log(err)
                  }
                })
              }
              else{
                //数据库中没有这个人的信息
                // 存入数据库
                var fGroup = []
                db.collection("user").add({
                  data:{
                    userInfo:that.data.userinfo,
                    fGroup:fGroup
                  }
                }).then(res=>{
                  console.log(res)
                })
              }
            })
          },
          fail:res=>{
            console.log("云函数调用失败")
          }
        })
      },
      fail:(res)=>{
        debugger
        console.log(res)
      }
    });
  
    
  },
  //退出登录
  clearLogin(){
    const that = this;
    wx.showModal({
      title:"确定退出当前账号吗",
      confirmColor:"#5677FC",
      success (res){
        if (res.confirm){
          wx.clearStorage()
          that.setData({
            userinfo:{},
            openid:""
          })
        }
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const ui=wx.getStorageSync('userinfo')
    this.setData({
      userinfo: ui,
      openid: ui.openid
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