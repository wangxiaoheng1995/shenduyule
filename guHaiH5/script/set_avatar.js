var user;
apiready = function () {
  fix_status_bar();
  user = $api.getStorage('user');
  if (user.avatar) {
    $('#avatar').attr('src', user.avatar);
    $('#avatarUrl').val(user.avatar);
  }
  else {
    $('#avatar').attr('src', '../image/yltlogo.png');
  }
  
  
  // 监听图片裁剪
  api.addEventListener({
    name: 'clip_success'
  }, function (ret, err) {
    //console.log(JSON.stringify(ret));
    if (ret) {
      $("#" + ret.value.element_id).val(ret.value.new_img_url);
      $("#" + ret.value.element_id).next().attr('src', ret.value.new_img_url);
    }
  });
  
  
  $("#sub").click(function () {
    var avatarUrl = $.trim($("#avatarUrl").val());
    //console.log(avatarUrl);
    // 判断头像是否合法
    if (avatarUrl == '') {
      toast("请设置头像");
      return false;
    }
    var user = $api.getStorage('user');
    api.showProgress({
      title: '设置中...',
      modal: false
    });
    api.ajax({
      url: PHP_SERVE_URL + '/uploadImg/index',
      method: 'post',
      data: {
        files: {
          file: avatarUrl,
        }
      }
    }, function (json, err) {
      //console.log(JSON.stringify(json));
      if (json.code == 0) {
        var avatarUrl = json.data[0];
        api.ajax({
          url: PHP_SERVE_URL + '/customer/setAvatar',
          method: 'post',
          data: {
            values: {
              openId: user.openId,
              avatar: avatarUrl,
              token: yltcrypt.cpt(user.openId)
            }
          }
        }, function (json, err) {
          //console.log(JSON.stringify(json));
          api.hideProgress();
          if (!json.code) {
            user.avatar = avatarUrl;
            $api.setStorage('user', user);
            // 页面跳转
            var toast = new auiToast();
            
            toast.success({title: '设置成功', duration: 2000});
            
            // var historyUser = $api.getStorage('historyUser');
            // historyUser.forEach(function (item, index) {
            //   if (item.login_name == user.login_name) {
            //     item.headimgurl = user.headimgurl;
            //   }
            // });
            // $api.setStorage("historyUser", historyUser);
            api.sendEvent({
              name: 'refresh_user_avatar',
              extra: {headurl: avatarUrl + '?x-oss-process=image/resize,m_pad,h_80,w_80'}
            });
            api.sendEvent({name: 'refresh_user_info', extra: {}});
            setTimeout("api.closeWin({})", 2000);
          } else {
            var toast = new auiToast();
            toast.fail({title: json.msg, duration: 2000});
          }
        });
      } else {
        var toast = new auiToast();
        toast.fail({title: json.msg, duration: 2000});
      }
    });
  });
  
};

function showAction() {
  var avatarUrl = $.trim($("#avatarUrl").val());
  if (avatarUrl != '' && /http:\/\//.test(avatarUrl)) {
    api.actionSheet({
      title: '更换头像',
      cancelTitle: '取消',
      buttons: ['拍一张', '从手机相册中选择'],
      style: {
        fontNormalColor: '#484848',
      }
    }, function (ret, err) {
      if (ret) {
        getPicture(ret.buttonIndex, 'noclip');
      }
    });
  } else {
    api.actionSheet({
      title: '更换头像',
      cancelTitle: '取消',
      buttons: ['拍一张', '从手机相册中选择', '裁剪'],
      style: {
        fontNormalColor: '#484848',
      }
    }, function (ret, err) {
      if (ret) {
        getPicture(ret.buttonIndex);
      }
    });
  }
  
  
}

function getPicture(sourceType, type) {
  if (sourceType == 1) { // 拍照
    //获取一张图片
    api.getPicture({
      sourceType: 'camera',
      encodingType: 'png',
      mediaValue: 'pic',
      allowEdit: false,
      quality: 90,
      saveToPhotoAlbum: true
    }, function (ret, err) {
      if (ret) {
        var imgSrc = ret.data;
        if (imgSrc != "") {
          var ele = $api.dom('#avatar');
          $api.attr(ele, 'src', imgSrc);
          var urlEle = $api.dom('#avatarUrl');
          $api.attr(urlEle, 'value', imgSrc);
          var avatarUrl = $.trim($("#avatarUrl").val());
          openWinPro('clip', 'element_id:avatarUrl,img_url:' + avatarUrl);
        }
      }
    });
  }
  else if (sourceType == 2) { // 从相机中选择
    //UIMediaScanner 是一个多媒体扫描器，可扫描系统的图片、视频等多媒体资源
    var UIMediaScanner = api.require('UIMediaScanner');
    UIMediaScanner.open({
      //返回的资源种类,picture（图片）,video（视频）,all（图片和视频）
      type: 'picture',
      //（可选项）图片显示的列数，须大于1
      column: 4,
      max: 1,
      //（可选项）图片排序方式,asc（旧->新）,desc（新->旧）
      sort: {
        key: 'time',
        order: 'desc'
      },
      //（可选项）模块各部分的文字内容
      texts: {
        stateText: '已选择*项',
        cancelText: '取消',
        finishText: '完成'
      },
      styles: {
        bg: '#fff',
        mark: {
          icon: '',
          position: 'bottom_right',
          size: 20
        },
        nav: {
          bg: '#eee',
          stateColor: '#000',
          stateSize: 18,
          cancleBg: 'rgba(0,0,0,0)',
          cancelColor: '#000',
          cancelSize: 18,
          finishBg: 'rgba(0,0,0,0)',
          finishColor: '#000',
          finishSize: 18
        }
      }
    }, function (ret) {
      if (ret) {
        if (getJsonObjLength(ret.list) != 0 && ret.list[0]) {
          var systemType = api.systemType;
          if (systemType == 'ios') {
            UIMediaScanner.transPath({
              path: ret.list[0].path
            }, function (transret, transerr) {
              var ele = $api.dom('#avatar');
              $api.attr(ele, 'src', transret.path);
              
              var urlEle = $api.dom('#avatarUrl');
              $api.attr(urlEle, 'value', transret.path);
              // 获取头像
              var avatarUrl = $.trim($("#avatarUrl").val());
              openWinPro('clip', 'element_id:avatarUrl,img_url:' + avatarUrl);
            });
          } else {
            var ele = $api.dom('#avatar');
            $api.attr(ele, 'src', ret.list[0].path);
            var urlEle = $api.dom('#avatarUrl');
            $api.attr(urlEle, 'value', ret.list[0].path);
            // 获取头像
            var avatarUrl = $.trim($("#avatarUrl").val());
            // console.log(ret.list[0].path);
            openWinPro('clip', 'element_id:avatarUrl,img_url:' + avatarUrl);
          }
        }
      }
    });
  } else if (sourceType == 3 && type != 'noclip') { // 裁剪图片
    // 获取头像
    var avatarUrl = $.trim($("#avatarUrl").val());
    // 判断头像是否合法
    if (avatarUrl == '') {
      toast("请设置头像");
      return false;
    }
    
    openWinPro('clip', 'element_id:avatarUrl,img_url:' + avatarUrl);
    
  }
}
