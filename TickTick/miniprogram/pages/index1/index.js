var util = require('../../utils/util.js')
var app = getApp()

Page({
  data: {
    eventList:[],
    calendar:{
              year:2021,
              month:11
            },
    showDelRow: -2,
    delRowButtonWidth: 0,
    touchTimer: {handler:null, lastX:null, lastY: null, startX: null, startY: null}
  },

  getTime(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options.d)
    var d = new Date(parseInt(options.d))
    console.log(decodeURI(options.n))
    var eventDate = util.formatDate(d)
    var eventName = decodeURI(options.n)

    return {
      id: options.i,
      name: eventName,
      d: d.getTime(),
      date: eventDate,
      days: util.daysLeft(d),
    }
  },

  // 实现滑条删除
  delRow: function(e){
    var targetId = e.currentTarget.id
    var rowIndex = parseInt(targetId.split("_")[1])
    var event = this.data.eventList[rowIndex]
    console.log(rowIndex + ' ' + event.name)
    let that = this
    wx.showModal({
      title: '',
      content: '确定要删除' + event.name + '吗？',
      success: function (res) {
        if (res.confirm) {
          console.log("will delete " + event.id)
          util.deleteEventById(event.id)
          that.setData({showDelRow: -1})
          that.initEventList()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  rowTouchStart: function (e) {
    this.setData({ showDelRow: -1, delRowButtonWidth: 0 })

    if (e.changedTouches.length > 0) {
      var x = e.changedTouches[0].clientX
      var y = e.changedTouches[0].clientY
      this.setData({
        touchTimer: { handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    }
  },

  rowTouchMove: function(e){
    if (!e.changedTouches[0]){
      return
    }
    var x = e.changedTouches[0].clientX
    var y = e.changedTouches[0].clientY
    if(this.data.touchTimer.startX == null){
      this.setData({
        touchTimer: {handler: null, startX: x, startY: y, lastX: x, lastY: y }
      })
    } else if (Math.abs(this.data.touchTimer.startX - x) > 40){
      var targetId = e.currentTarget.id
      var rowIndex = parseInt(targetId.split("_")[1])
      var w = (this.data.touchTimer.startX - x)/2;
      console.log('touchmove ' + w + ' on row #' + rowIndex)
      if(w <= 0){
        w = 0
        rowIndex = -1
      }else if(w > 120){
        w = 120
      }
      this.setData({ showDelRow: rowIndex, delRowButtonWidth: w })
      this.setData({
        touchTimer: {
            handler: null, 
            startX: this.data.touchTimer.startX, 
            startY: this.data.touchTimer.startY,
            lastX: x, 
            lastY: y }
      })
    }
  },

  rowTouchEnd: function(e){
    this.rowTouchCancel()
  },

  rowTouchCancel: function(e){
    if (this.data.delRowButtonWidth < 80){
      this.setData({showDelRow: -1, delRowButtonWidth: 0})
    }else{
      this.setData({delRowButtonWidth: 120 })
    }
    this.setData({
      touchTimer: {handler: null, startX: null, startY: null, lastX: null, lastY: null }
    })
  },

  // 添加ddl倒计时
  addEvent: function(){
    wx.navigateTo({
      url: '/pages/event/edit'
    })
  },

  // 进行操作后初始化页面DDL排序
  initEventList: function(){
    wx.cloud.database().collection("time").get({
      success:res=>{
        var myEvents = res.data
        var eventList = []
        for(var i=0; i<myEvents.length; i++){
          var event = {}
          var myEvent = myEvents[i]
          event["id"] = myEvent._id
          event["name"] = myEvent.name
          event["d"] = parseInt(myEvent.d)
          event["date"] = util.formatDate(new Date(event.d))
          event["urlParams"] = "i=" + event.id + "&d=" + event.d + "&n=" + encodeURI(event.name)
          var p = this.getTime({
            i:event.id,
            d:event.d,
            n:encodeURI(event.name)
          })
    
          eventList.push({
            ...event,
            ...p
          })
        }
        this.setData({eventList: eventList})
        this.data.timer = setInterval(() =>{ 
          for(var i in this.data.eventList){
            this.data.eventList[i]["leftTime"] = util.getTimeLeft(this.data.eventList[i].d)
          }
          this.setData({eventList: this.data.eventList})
        }, 1000);   
      }
    })
    // var myEvents = util.getMyEvents()
    // try{
    //   myEvents.sort(function(e1, e2){
    //     return e1.d - e2.d
    //   })
    // }catch(ex){
    // }

  },

  onShow: function () {
    const ui=wx.getStorageSync('userinfo')
    this.setData({
      userinfo: ui,
      openid: ui.openid
    })
    var now = new Date()
    this.setData({calendar:{year: now.getFullYear(), month: (now.getMonth() < 6 ? 0 : 6)}})
    this.initEventList()
    try{
    }catch(ex){}
  }

})
