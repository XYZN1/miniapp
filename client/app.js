App({
  globalData: {
    ws: null,
    clientId: null,
    roomId: null,
    userInfo: null,
  },
  onLaunch() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          wx.getUserInfo({ success: (r) => { this.globalData.userInfo = r.userInfo; } });
        }
      },
    });
  },
});
