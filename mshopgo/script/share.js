function sharewithData(type,scene){
    if (type == 'wx') {
        wxShare(scene);
    } else if (type == 'qq') {
        qqShare(scene);
    }else if (type == 'sina') {
        wbShare();
    }else if (type == 'sms') {
        smsShare();
    }else if (type=='reload'){
        $a.sendEvt('location-reload');
        api.closeFrame();
    }
    else if (type=='copylink'){
        var clipBoard = api.require('clipBoard');
        clipBoard.set({
            value: contentUrl
        }, function(ret, err) {
            if (ret.status) {
                $a.toast('已复制');
            }
            api.closeFrame();
        });
    }
}
function wxShare(scene) {
    var wx = api.require('wx');
    wx.isInstalled(function (ret, err) {
        if (!ret.installed) {
            $a.toast('当前设备未安装微信客户端');
        }else{
            wx.shareWebpage({
                apiKey: '',
                scene: scene,
                title: title,
                description: desciption,
                thumb: img,
                contentUrl: contentUrl
            }, function (ret, err) {
                if (ret.status) {
                    $a.toast('分享成功');
                    api.closeFrame();
                } else {
                    switch (err.code) {
                        case -1:
                            $a.toast('未知错误');
                            break;
                        case 1:
                            $a.toast('apiKey非法');
                            break;
                        case 2:
                            $a.toast('用户取消');
                            break;
                        case 3:
                            $a.toast('发送失败');
                            break;
                        case 4:
                            $a.toast('授权拒绝');
                            break;
                        case 5:
                            $a.toast('微信服务器返回的不支持错误');
                            break;
                        case 7:
                            $a.toast('注册SDK失败');
                            break;
                        default:
                            $a.toast('分享失败');
                            break;

                    }
                }
            });
        }
    });
}

function qqShare(scene) {
    var qq = api.require('QQPlus');
    qq.installed(function (ret, err) {
        if (!ret.status) {
            $a.toast('当前设备未安装QQ');
        }
    });
    qq.shareNews({
        url: contentUrl,
        title: title,
        description: desciption,
        imgUrl: img,
        type: scene
    });
}

function wbShare() {
    var weibo = api.require('weibo');
    weibo.shareWebPage({
        text: desciption + contentUrl,
        title: title,
        description: desciption,
        thumb: img,
        contentUrl: contentUrl
    }, function (ret, err) {
        if (ret.status) {
            $a.toast('分享成功');
        }
    });
}

function smsShare() {
    api.sms({
        numbers: [],
        text: title + desciption + contentUrl
    }, function (ret, err) {
        if (ret && ret.status) {
            //已发送
            $a.toast('分享成功');
            api.closeFrame();
        } else {
            //发送失败
        }
    });

}