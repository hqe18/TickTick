// pages/task/task.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText:"",
    leftCount:0,
    allCompleted:false,
    notebook:[
    ],
    imageSrc:null,
    bg_hidden:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // 加载任务
  onLoad: function (options) {
    var that = this;
    var notebooks = [];
    that.setData({
      imageSrc:app.globalData.taskImg
    })
    wx.cloud.database().collection("task").get({
      success:res=>{
        if(res.data!=null)
        notebooks = res.data.filter(function(item){
          return !item.completed;
        })
        that.setData({
          notebook:res.data,
          leftCount:notebooks.length,
          imageSrc:app.globalData.taskImg
        })
      }
    })

    // wx.getStorage({
    //   key: 'notebook',
    //   success (res) {
    //     if(res.data!=null)
    //     notebooks = res.data.filter(function(item){
    //       return !item.completed;
    //     })
    //     that.setData({
    //       notebook:res.data,
    //       leftCount:notebooks.length,
    //       imageSrc:app.globalData.taskImg
    //     })
    //   }
    // })

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
    const ui=wx.getStorageSync('userinfo')
    this.setData({
      userinfo: ui,
      openid: ui.openid
    })
    this.setData({
      bg_hidden: app.globalData.bg_hidden
    });

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

  },

  // 添加任务方法
  addNoteHandle:function(){
    // 1.点击添加
    // 2.获取文本框内容
         // console.log(this.data.searchText)
    // 3.将这个值添加到任务列表，任务内容不能为空
    if(!this.data.searchText)return;
    var notebooks = this.data.notebook;
    notebooks.push({
      name:this.data.searchText,
      completed:false,
    })
    wx.cloud.database().collection("task").add({
      data:{
        name:this.data.searchText,
        completed:false
      }
    })
    // 数据缓存在本地中
    wx.setStorage({
      data: notebooks,
      key: 'notebook',
    })

    // 数据更新
    this.setData({
      notebook:notebooks,
      searchText:'',
      leftCount:this.data.leftCount+1
      })
  },

  //1.2 获取文本框的值并赋值到searchText
  inputChangeHandle:function(e){
         // console.log(e.detail)
    this.setData({
      searchText:e.detail.value
    })
          // console.log(e.detail)
  },

  // 切换任务状态
  toggleNoteHandle:function(e){
    // console.log(this.data.notebook[e.currentTarget.dataset.index])
    var notebook = this.data.notebook[e.currentTarget.dataset.index]
    notebook.completed = !notebook.completed;
    // 根据当前任务完成状态决定任务数量的加减
    var leftCountNew = this.data.leftCount+(notebook.completed?-1:1)
    wx.setStorage({
      data: this.data.notebook,
      key: 'notebook'
    })
    this.setData({
      notebook:this.data.notebook,
      leftCount:leftCountNew
    });
  },

  // 删除任务
  removeNoteHandle:function(e){
    var notebooks = this.data.notebook;
    wx.cloud.database().collection("task").doc(this.data.notebook[e.currentTarget.dataset.index]._id).remove()
    var itemobj = notebooks.splice(e.currentTarget.dataset.index,1)[0];
    var leftCountNew = this.data.leftCount-(itemobj.completed?0:1)
    wx.setStorage({
      data: notebooks,
      key: "notebook"
    })
    this.setData({
      notebook:notebooks,
      leftCount:leftCountNew
    })
  },
  // 改变状态
  toggleAllHandle:function(){
    this.data.allCompleted = !this.data.allCompleted;
    var notebooks = this.data.notebook;
    var that = this;
    notebooks.forEach(function(item){
      item.completed = that.data.allCompleted;
    })
    wx.cloud.database().collection("task").where({
      completed:false
    }).update({
      data:{
        completed:true
      }
    })
    var leftCountNew = this.data.allCompleted?0:this.data.notebook.length;
    wx.setStorage({
      data: notebooks,
      key: "notebook"
    })
    this.setData({
      notebook:notebooks,
      leftCount:leftCountNew
    });
  },
  // 清除已完成
  clearCompletedHandle:function(){
    var notebooks= [];
    this.data.notebook.forEach(function(item){
      if(!item.completed){
        notebooks.push(item)
      }
    }),
    wx.cloud.database().collection("task").where({
      completed:true
    }).remove()
    wx.setStorage({
      data: notebooks,
      key: "notebook"
    }),
    this.setData({
      notebook:notebooks
    })
  }
})