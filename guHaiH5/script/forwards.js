var title = desciption = img = url = '';
function showAction(ptitle, pdesciption, pimg, purl) {
    title = ptitle;
    desciption = pdesciption;
    img = pimg;
    url = purl;
  $("#share").show();
}


function shareopen() {
  $("#share").hide();
}

function sharewithData(type,scene){
  if (type == 'wx') {
    wxShare(scene);
  } else if (type == 'qq') {
    qqShare(scene);
  }else if (type == 'sina') {
    wbShare();
  }else if (type == 'sms') {
    smsShare();
  }else if (type=='circle'){
    shareToCircle();
  }else if (type=='reload'){
    location.reload();
  }else if (type=='copylink'){
    var clipBoard = api.require('clipBoard');
    clipBoard.set({
      value: contentUrl
    }, function(ret, err) {
      if (ret.status) {
        toastSuccess("已复制",2000)
      }
    });
  }
}

function wxShare(scene) {
  var wx = api.require('wx');
  wx.isInstalled(function (ret, err) {
    if (!ret.installed) {
      toastSuccess('当前设备未安装微信客户端');
    }
  });
  wx.shareWebpage({
    apiKey: '',
    scene: scene,
    title: title,
    description: desciption,
    thumb: img,
    contentUrl: url
  }, function (ret, err) {
    if (ret.status) {
      toastSuccess('分享成功')
    }
  });
}
function smsShare() {
  api.sms({
    numbers: [],
    text: title + desciption + url
  }, function (ret, err) {
    if (ret && ret.status) {
      //已发送
      api.toast({msg: '分享成功', duration: 2000, location: 'middle'});
    } else {
      //发送失败
    }
  });
  
}
