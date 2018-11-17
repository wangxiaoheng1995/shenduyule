var showPhoto = '', tapindex = 0, nowDom, compactPicture = null;
// $(".s_photoset img").on("click", function() {
//     var index = $(this).parent().index();
//     tapindex = index;
//     if ($(this).attr("src") == "../image/smrz_add_image.png") {
//         openActionsheet(index)
//     } else {
//         openActionphoto(index)
//         showPhoto = $(this).attr("src")
//     }
// })

var idCardFront = idCardBack = idCardHand = trueName = carId = '';
var isAuthen = false;
apiready = function () {
    var AuthTip = api.pageParam.AuthTip;

    if (!AuthTip) {
        AuthTip = "*为了您的账户安全，请进行实名认证";
    }

    $("#AuthTip").text(AuthTip);

    // 监听页面出现
    api.addEventListener({
        name: 'viewdisappear'
    }, function () {
        if (isAuthen) {
            //console.log('jw-authen.viewdisappear');
            api.closeWin({
                name: 'jw-authen'
            });
        }
    });

    //图片裁剪
    api.addEventListener({
        name: 'clip_success'
    }, function (ret, err) {
        if(ret){
           //console.log(JSON.stringify(ret));
            ajaxOcrIdcard(tapindex,ret.value.new_img_url);
        }
        /*if (ret) {
            $("#" + ret.value.element_id).val(ret.value.new_img_url);
            $("#" + ret.value.element_id).next().attr('src', ret.value.new_img_url);
        }*/
    });

    compactPicture = api.require('compactPicture');
    api.parseTapmode();

    $(".photo_set").on("click", function (event) {
        var funType = $(this).attr("data-index");
        setPhoto(event.target, funType);
    })
    function setPhoto(dom, index) {
        var nowAttr = dom.getAttribute("src");
        tapindex = index;
        nowDom = dom;
        if (nowAttr == "../../image/my/smrz_add_image.png") {
            openActionsheet(index)
        } else {
            openActionphoto(index)
            showPhoto = nowAttr;
        }
    }

    $(".s_photoshow").on("click", function () {
        $(".s_photoshow").hide()
    });
    $(".delete_no").on("click", function () {
        $(".s_showdelete").addClass("s_hide")
    });
    $("#deletePhoto").on("click", function () {
        nowDom.setAttribute("src", "../image/smrz_add_image.png");
        $(".s_showdelete").addClass("s_hide");
        $(".s_submitexa").removeClass("s_submitok");
        correctPhoto--;
    })
    // 选择照片
    var actionsheet = new auiActionsheet();
//打开相册或拍照
    function openActionsheet(pnum) {
        actionsheet.init({
            frameBounces: true,  //当前页面是否弹动，（主要针对安卓端）
            cancelTitle: '取消',
            buttons: ['拍摄', '从手机相册选择']
        }, function (ret) {
            if (ret.buttonIndex == 1) {
                //获取一张图片
                api.getPicture({
                    sourceType: 'camera',
                    encodingType: 'png',
                    mediaValue: 'pic',
                    allowEdit: false,
                    quality: 100,
                    saveToPhotoAlbum: true
                }, function (ret, err) {
                    if (ret) {
                        var imgSrc = ret.data;
                        if (imgSrc != "") {
                            $a.openWin('my_frm-clip', 'element_id:avatarUrl,img_url:' + imgSrc+',w:300,h:210');
                            //ajaxOcrIdcard(pnum, imgSrc);
                        }
                    }
                });
            } else if (ret.buttonIndex == 2) {
                api.getPicture({
                    sourceType: 'album',
                    encodingType: 'png',
                    mediaValue: 'pic',
                    allowEdit: false,
                    quality: 80,
                    saveToPhotoAlbum: true
                }, function (ret, err) {
                    if (ret) {
                        var imgSrc = ret.data;
                        if (imgSrc != "") {
                            $a.openWin('my_frm-clip', 'element_id:avatarUrl,img_url:' +imgSrc+',w:300,h:210');
                            //ajaxOcrIdcard(pnum, imgSrc);
                        }
                    }
                });
            }
        })
    }

//    选择照片的操作
    function openActionphoto(pnum) {
        actionsheet.init({
            frameBounces: true, //当前页面是否弹动，（主要针对安卓端）
            cancelTitle: '取消',
            buttons: ['看大图', '删除']
        }, function (ret) {
            if (ret.buttonIndex == 1) {
                $(".s_photoshow img").attr("src", showPhoto);
                $(".s_photoshow").show()
            } else if (ret.buttonIndex == 2) {
                $(".s_showdelete").removeClass("s_hide")
            }
        })
    }

// 选择省市区
//var area1 = new LArea();
//area1.init({
//    'trigger': '#demo1', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
//    'valueTo': '#value1', //选择完毕后id属性输出到该位置
//    'keys': {
//        id: 'id',
//        name: 'name'
//    }, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
//    'type': 1, //数据源类型
//    'data': LAreaData //数据源
//});
//area1.value = [1, 13, 3]; //控制初始位置，注意：该方法并不会影响到input的value

//提交实名认证
    $(".s_submitexa").on("click", function () {
        var theArea = $("#city-picker").val();
        var theAreaSplit = theArea.replace(" ", ",");
        submitApply()
    })
    function submitApply() {
        if ($('#name').val() == '') {
            toast('身份证号码识别有误，请重新上传');
        }else if($('.s_submitexa').hasClass('s_submitok')) {
            realnameAuth();
        }
    }
//服务端实名认证
    function realnameAuth() {
        var user = $api.getStorage('user');
        if (!user) {
            toast('登录超时，请稍后再试');
            return;
        }
        api.showProgress({
            title: '设置中...',
            modal: false
        });
        // 获取用户相关信息
        api.ajax({
            url: PHP_SERVE_URL + '/Customer/SetAuthentication2',
            method: 'post',
            data: {
                values: {
                    customerId: formatUid(user.customer_id),
                    area: $("#city-picker").val().replaceAll(" ", ","),
                    streetAddress: $("#detailAddre").val(),
                    idCardFront: idCardFront,
                    idCardBack: idCardBack,
                    idCardHand: idCardHand,
                    trueName: trueName,
                    carId: carId
                }
            }
        }, function (json, err) {
            api.hideProgress();
            if (json.result) {
                // 页面跳转
                api.toast({
                    msg: '认证成功',
                    duration: 2000,
                    location: 'middle'
                });
                api.sendEvent({
                    name: 'add_edit_auth',
                    extra: {
                        msg: '操作成功'
                    }
                });
                isAuthen = true;
                openWin('jw-authenadopt');
            } else if (json.msg == "您已经实名认证") {
                openWin('jw-authenadopt');
            } else {
                openDialog(json.msg)
            }
        });
    }

    //提交错误弹框
    api.parseTapmode();
    var dialog = new auiDialog();
    function openDialog(msg) {
        dialog.alert({
            msg: msg,
            buttons: ['取消', '继续验证']
        }, function (ret) {
            console.log(ret)
        })
    }

//识别身份证图片
    function OcrIdcard(imgSrc, callback) {
        api.showProgress({title: '照片识别中...', modal: false});
        api.ajax({
             //url: PHP_SERVE_URL + '/Common/OcrIdcard',
            url: PHP_UPLOAD_SERVE + '/UploadImg/idCardCheck',
            method: 'post',
            data: {
                files: {
                    imgurl: imgSrc
                }
            }
        }, function (json, err) {
            api.hideProgress();
            if (json.code == 0) {
                callback(json.data);
            } else {
                api.toast({
                    msg: '认证失败，请重新上传',
                    duration: 2000,
                    location: 'middle'
                });
            }
        });
    }

//发送后台识别照片
    function ajaxOcrIdcard(pnum, imgSrc) {
        if (pnum == 0) {
            OcrIdcard(imgSrc, function (json) {
                $("#name").val(json.name);
                $("#number").val(json.num);
                $("#detailAddre").val(json.address);
                idCardFront = json.imgurl;
                trueName = json.name;
                carId = json.num;
                nowDom.setAttribute("src", imgSrc);
            });
        } else {
            api.ajax({
                url: PHP_UPLOAD_SERVE + '/uploadImg/index',
                method: 'post',
                data: {files: {avatar: imgSrc}}
            }, function (json, err) {
                if (json.code == 0) {
                    if (pnum == 1) {
                        idCardBack = json.data[0];
                    } else {
                        idCardHand = json.data[0];
                    }
                    nowDom.setAttribute("src", json.data[0]);
                } else {
                    toast('文件处理失败');
                }
            });
        }
        lingSubmit();
    }
}

//压缩
/*var imgs = [];
 imgs.push(imgSrc);
 compactPicture.HittingPic(
 {
 picpatharray: imgs,
 size: 8
 },
 function (ret) {
 if (ret) {
 api.ajax({
 url: PHP_UPLOAD_SERVE + '/uploadImg/index',
 method: 'post',
 data: {files: {avatar: ret.states[0]}}
 }, function (json, err) {
 if (json.code == 0) {
 if (pnum == 1) {
 idCardBack = json.data[0];
 } else {
 idCardHand = json.data[0];
 }
 nowDom.setAttribute("src", ret.states[0]);
 } else {
 api.toast({msg: '文件处理失败', duration: 2000, location: 'middle'});
 }
 })
 } else {
 api.toast({msg: '文件处理失败', duration: 2000, location: 'middle'});
 }
 });*/