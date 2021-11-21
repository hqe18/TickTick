var util = require('../../utils/util.js')

Page({
  data:{
      event:{
        id: null,
        name: '',
        d: 0,
        date: '',
        days: 43,
      },
      editable: false,
      watchable: false,
      deleteable: false,
      showDate: false,
      shareit: true,
      backButtonType: "default",
      hint: '点右上角可把此页转发到群对话内'
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options.d)
    var d = new Date(parseInt(options.d))
    console.log(decodeURI(options.n))

    var eventDate = util.formatDate(d)
    var eventName = decodeURI(options.n)
    var showDate = (eventName.length > 6 || eventDate.length > 6)  
    var showMore = true

    this.setData({
      event:{
            id: options.i,
            name: eventName,
            d: d.getTime(),
            date: eventDate,
            days: util.daysLeft(d),
          },
      showDate: showDate,
      showMore: showMore
      })
     console.log("showDate=" + showDate)
     if(!wx.reLaunch){
       //底层框架1.0
       this.setData({hint: '可把此页分享到群对话内'})
     }
     wx.setNavigationBarTitle({
        title: (showDate ? eventName : eventDate + '' + eventName)
    })
  },
  onReady:function(){
    // 页面渲染完成，上报事件；
    try {
      var ps = getCurrentPages()
      if (ps.length == 1) {
        //第一页就是显示事件页面，表示从绘话点击分享进入
        wx.reportAnalytics('view_event', {
          event_name: this.data.event.name,
          days_left: this.data.event.days
        })
      }
    } catch (ex) {
      console.error("上报事件时出错", ex)
    }
  },
  onShow:function(){
    var myEvents = util.getMyEvents();
    var found = false
    for(var i=0; i<myEvents.length; i++){
      if(myEvents[i].id == this.data.event.id){
        found = true
        break
      }
    }
    if(found){
      var canShare = false
      try{
        var res = wx.getSystemInfoSync()
        var sdkversion = res.SDKVersion
        if (sdkversion) {
          sdkversion = sdkversion.substring(0, sdkversion.lastIndexOf('.'))
          console.log("SDKVersion=" + sdkversion)
          if(parseFloat(sdkversion) >= 1.2){
            canShare = true
          }else{
            this.setData({
              showMore: false
            })
          }
        }
      }catch(e){
        console.log("ERROR while get SDKVersion: " + e)
      }

      this.setData({
        editable: true,
        deleteable: true,
        watchable: false,
        shareit: canShare,
        backButtonType: canShare ? "default" : "primary"
      })
    }else{
      this.setData({
        editable: false,
        deleteable: false,
        watchable: true,
        shareit: false,
        backButtonType: "default"
      })
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  onShareAppMessage: function () {
    var title
    if(this.data.showDate){
      title = '距' + this.data.event.name
    }else{
      title = '距' + this.data.event.date + '' + this.data.event.name
    }
    if(this.data.event.days > 7){
      title += '还有'
    } else if(this.data.event.days >= 0){
      title += '仅剩'
    } else{
      title += '已经'
    }
    return {
      title: title,
      path: '/pages/event/event?i=' + this.data.event.id + '&d=' + this.data.event.d + "&n=" + encodeURI(this.data.event.name)
    }
  },
  watchThisEvent: function(){
    var newEvent = {
      name: this.data.event.name,
      d: this.data.event.d,
      id: this.data.event.id
    }
    util.saveEventToStoreage(newEvent)
    let that  = this
    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 2000,
      complete: function(){
        that.gotoMyEvents()
      }
    })
  },
  gotoMyEvents: function(e){
    if(wx.reLaunch){
      wx.reLaunch({
          url: '/pages/index/index'
      })
    }else{
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
  },
  deleteEvent: function(e){
    let that = this
    wx.showModal({
      title: '',
      content: '要删除这个事件吗？',
      success: function(res) {
        if (res.confirm) {
          console.log("will delete " + that.data.event.id)
          util.deleteEventById(that.data.event.id)
          that.gotoMyEvents()
        } else if (res.cancel) {
        }
      }
    })
  },
  editEvent: function(e){
    var editUrl = '/pages/event/edit?id=' + this.data.event.id
    var ps = getCurrentPages()
    if(ps.length >= 3){
      //为了避免超过5级
      if(ps[1].data.event){
        //第2个页面是展示页
        wx.redirectTo({
           url: editUrl
        })
        return
      }
     }
    wx.navigateTo({
        url: editUrl
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      event:{
        id: this.data.event.id,
        name: this.data.event.name,
        d: this.data.event.d,
        date: this.data.event.date,
        days: this.data.event.days,
      }})
    wx.stopPullDownRefresh()
  }
})