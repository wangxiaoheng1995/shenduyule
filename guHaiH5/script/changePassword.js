apiready = function () {
  fix_status_bar();
  
};

$("#sub").click(function () {
  // 判断输入的值是否合法
  var oldPwd = $.trim($("#oldPwd").val());
  if (oldPwd == '') {
    toast("原密码不能为空");
    return false;
  }
  
  var newPwd = $.trim($("#newPwd").val());
  if (newPwd == '') {
    toast("新密码不能为空");
    return false;
  }
  
  var reg = /^[A-Za-z0-9_]{6,16}$/; // 6到16位字母数字或下划线
  if (!reg.test(newPwd)) {
    toast("新密码需6~16字母数字或下划线");
    return false;
  }
  
  // 判断新密码是否与确认密码一致
  var confirmPwd = $.trim($("#confirmPwd").val());
  if (confirmPwd != newPwd) {
    toast("确认密码与新密码不一致");
    return false;
  }
  
  var user = $api.getStorage('user');
  // var customerId = user.customer_id;
  
  api.showProgress({
    title: '设置中...',
    modal: false
  });
  // 获取用户相关信息
  api.ajax({
    url: PHP_SERVE_URL + '/customer/customer',
    method: 'post',
    data: {
      values: {
        tel: user.tel,
        passwd: newPwd,
        smsCode: '',
        pwdType: 1,
        token: yltcrypt.cpt(user.tel)
      }
    }
  }, function (json, err) {
    // api.hideProgress();
    //console.log(JSON.stringify(json));
    if (json.result) {
      // 页面跳转
      var toast = new auiToast();
      toast.success({
        title: json.msg,
        duration: 2000
      });
      setTimeout("api.closeWin({})", 2000);
    } else {
      var toast = new auiToast();
      toast.fail({
        title: json.msg,
        duration: 2000
      });
    }
  });
  
});

