  //获取店铺信息
  // listenLogin();
  // 检测是否已登录
  var user = $api.getStorage('user');
  vm = new Vue({
    el: "#sign",
    data: {
      signData: "",
      click: false,
    },
    methods: {
      onceSign: function () {
          var self = this;
        if (typeof user == 'undefined') {// 登录
          location.href='trading_login.html';
        } else {
          // 获取签到信息
          if (self.click) {
            return false;
          } else {
            api.ajax({
              url: PHP_SERVE_URL + '/customer/sign',
              method: 'post',
              data: {
                values: {
                  openId: user.openId,
                  token: yltcrypt.cpt(user.openId)
                }
              }
            }, function (json, err) {
              var atoast = new auiToast();
              if (!json.code) {
                self.click = true;
                atoast.success({
                  title: "恭喜领到" + json.coin + "个金币",
                  duration: 2000
                });
                setTimeout(function () {
                  // console.log("刷新");
                  self.getData();
                }, 300)
              } else {
                toast(json.msg);
              }
            });
          }
        }
        self.click = true;
      },
      getData: function () {
        var self = this;
        $.ajax({
          url: PHP_SERVE_URL + '/customer/getSignData',
          type: 'post',
          data: {
              openId: user.openId
          },
            success:function (json, err) {
                if (json.code == 0) {
                    // hideProgress();

                    self.signData = json;

                    setTimeout(function(){
                        $("#content").show();
                    },300)
                } else {
                    var aToast = new auiToast();
                    aToast.fail({
                        title: json.msg,
                        duration: 2000
                    });
                }
            }
        });
      }
    },
    mounted: function () {
      var self = this;
      // if (typeof user == 'undefined') {// 登录
      //   openWin('trading_login');
      // } else {
      // 获取签到信息
      // showProgress();
      self.getData();
      // }
    }
  });
