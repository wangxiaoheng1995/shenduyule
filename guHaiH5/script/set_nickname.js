var user;
apiready = function () {
    fix_status_bar();
    user = $api.getStorage('user');
    if (user.nickName != '' || typeof user.nickName != 'undefined') {
        $('#nickname').val(user.nickName);
    }
    $("#sub").click(function () {
        // 判断输入的值是否合法
        var nickName = $.trim($("#nickname").val());
        if (nickName == '') {
            toast("昵称不能为空");
            return false;
        }
        // 获取用户相关信息
        api.ajax({
            url: PHP_SERVE_URL + '/customer/setNickName',
            method: 'post',
            data: {
                values: {
                    openId: user.openId,
                    nickName: nickName,
                    token: yltcrypt.cpt(user.openId)
                }
            }
        }, function (json, err) {
            // hideProgress();
            if (json.code == 0) {
                user.nickName = nickName;
                //console.log(nickName);
                $api.setStorage('user', user);
                // var historyUser = $api.getStorage('historyUser');
                // historyUser.forEach(function (item, index) {
                //   if (item.login_name == user.login_name) {
                //     item.realName = user.realName;
                //   }
                // });
                //$api.setStorage("historyUser", historyUser);
                api.sendEvent({
                    name: 'refresh_user_nickname',
                    extra: {
                        nickName: nickName
                    }
                });
                // 页面跳转
                var toast = new auiToast();
                toast.success({
                    title: json.msg,
                    duration: 2000
                });
                api.sendEvent({
                    name: 'refresh_user_info',
                    extra: {}
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
};