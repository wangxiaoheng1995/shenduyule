//表情存放目录
var emotionData, user;
var header_h;
apiready = function () {
    fix_status_bar();
    header_h = api.pageParam.header_h;
    user = $api.getStorage('user');
    //user.avatar
    if (typeof user == "undefined") {
        api.toast({
            msg: '登陆异常',
            duration: 2000,
            location: 'bottom'
        });
    }
    gettime();
    loadUiChatBox();
    //存储图标表情
    getImgsPaths(function (emotion) {
        emotionData = emotion;
    });
    //监听收到新消息写入
}
//获取当前时间
function gettime() {
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var day = time.getDate();
    $("#time").text(year + "年" + month + "月" + day + "日");
}
/*一个工具方法：可以获取所有表情图片的名称和真实URL地址，以JSON对象形式返回。其中以表情文本为 属性名，以图片真实路径为属性值*/
function getImgsPaths(callback) {
    var jsonPath = BASE_EMOTION_PATH + "/emotion.json";
    //表情的JSON数组
    api.readFile({
        path: jsonPath
    }, function (ret, err) {
        if (ret.status) {
            var emotionArray = JSON.parse(ret.data);
            var emotion = {};
            for (var idx in emotionArray) {
                var emotionItem = emotionArray[idx];
                var emotionText = emotionItem["text"];
                var emotionUrl = "../../image/uiChatBox/emotion/" + emotionItem["name"] + ".png";
                emotion[emotionText] = emotionUrl;
            }
            //console.log('emotion:'+JSON.stringify(emotion));
            /*把emotion对象 回调出去*/
            if ("function" === typeof(callback)) {
                callback(emotion);
            }
        }
    });
}
//替换所有的回车换行
function transferBr(content) {
    var string = content;
    try {
        string = string.replace(/\r\n/g, "<br>")
        string = string.replace(/\n/g, "<br>");
    } catch (e) {
        alert(e.message);
    }
    return string;
}
//加载聊天输入框
function loadUiChatBox() {
    UIChatBox = api.require('UIChatBox');
    uiChatBoxOpen();
    uiChatBoxListener();
}
//重新加载聊天输入框(自定义表情改变后，需要重新加载)
function reloadUiChatBox() {
    UIChatBox.close();
    setTimeout("uiChatBoxOpen();", 2000);
}

function uiChatBoxOpen() {
    //console.log('run in uiChatBoxOpen');
    UIChatBox.open({
        placeholder: '输入发送内容',
        autoFocus: false,
        emotionPath: BASE_EMOTION_PATH,
        //输入框显示的最大行数（高度自适应）
        maxRows: 4,
        //聊天输入框模块可配置的文本
        texts: {
            //（可选项）JSON对象；录音按钮文字内容
            recordBtn: {
                //（可选项）字符串类型；按钮常态的标题，默认：'按住 说话'
                normalTitle: '按住 说话',
                //（可选项）字符串类型；按钮按下时的标题，默认：'松开 结束'
                activeTitle: '松开 结束'
            }
        },
        styles: {
            //（可选项）JSON对象；输入区域（输入框及两侧按钮）整体样式
            inputBar: {
                borderColor: '#d9d9d9',
                bgColor: '#f2f2f2'
            },
            //（可选项）JSON对象；输入框样式
            inputBox: {
                borderColor: '#B3B3B3',
                bgColor: '#FFFFFF'
            },
            // emotionBtn: {
            //     normalImg: BASE_CHATBOX_PATH + '/face.png'
            // },
            // extrasBtn: {
            //     normalImg: BASE_CHATBOX_PATH + '/add.png'
            // },
            keyboardBtn: {
                normalImg: BASE_CHATBOX_PATH + '/key.png'
            },
            // speechBtn: {
            //     normalImg: BASE_CHATBOX_PATH + '/cam.png'
            // },
            //JSON对象；“按住 录音”按钮的样式
            // recordBtn: {
            //     //（可选项）字符串类型；按钮常态的背景，支持rgb，rgba，#，图片路径（本地路径，fs://，widget://）；默认：'#c4c4c4'
            //     normalBg: '#c4c4c4',
            //     //（可选项）字符串类型；按钮按下时的背景，支持rgb，rgba，#，图片路径（本地路径，fs://，widget://）；默认：'#999999'；
            //     //normalBg 和activeBg 必须保持一致，同为颜色值，或同为图片路径
            //     activeBg: '#999999',
            //     color: '#000',
            //     size: 14
            // },
            indicator: {
                target: 'both',
                color: '#c4c4c4',
                activeColor: '#9e9e9e'
            }
        },
        extras: uiChatBoxExtras()
    }, function (ret, err) {
        //console.log('click event:'+JSON.stringify(ret));
        //字符串类型；回调的事件类型，
        //取值范围：
        //show（该模块打开成功）
        //send（用户点击发送按钮）
        //clickExtras（用户点击附加功能面板内的按钮）
        //数字类型；当 eventType 为 clickExtras 时，此参数为用户点击附加功能按钮的索引，否则为 undefined
        //字符串类型；当 eventType 为 send 时，此参数返回输入框的内容，否则返回 undefined
        //点击附加功能面板
        // if (ret.eventType == 'clickExtras') {
        //     var c_index = ret.index;
        //     //uiChatBoxEventHandler(c_index);
        // }
        //点击发送按钮
        if (ret.eventType == 'send') {

            /*用户输入表情或文字*/
            /*使用读文件方法，读json*/
            var send_msg_old = ret.msg;
            var sendMsg = transText(send_msg_old);

            if ($api.trimAll(sendMsg).length != 0) {
                var sender = {
                    avatar: user.avatar,
                    msg: sendMsg
                };
                var innerText = doT.template($("#my_tmpl").text());
                $("#content").append(innerText(sender));
                //关闭键盘
                //uiChatBoxCloseKeyboard();
                //发送消息的函数，后面会有介绍
                // sendText(send_msg_old, sendMsg, '','');
                api.ajax({
                    url: PHP_SERVE_URL + '/im/chat',
                    method: 'post',
                    data: {
                        values: {
                            openId: user.openId,
                            memo: sendMsg
                        }
                    }
                }, function (ret, err) {
                    if (ret) {
                        var innerTextB = doT.template($("#robot_tmpl").text());
                        $("#content").append(innerTextB(ret.data));
                        goBottom();
                        //console.log(JSON.stringify(ret.data));
                    } else {
                        //console.log(JSON.stringify(err));
                    }
                });

            } else {
                //为ipad写的
            }
        }
    });
}
//发送文本信息
function sendText(send_msg_old, sendMsg, conver_type, msg_extra) {
    //向会话列表页发送消息事件
    api.sendEvent({
        name: 'sendMessage',
        extra: {
            type: 'text',
            targetId: '11',
            content: sendMsg,
            contentOld: send_msg_old,
            conversationType: conver_type,
            extra: msg_extra
        }
    })
}
//关闭输入框
function uiChatBoxClose() {
    //$api.css($api.byId('menu'), 'display:none;');
    UIChatBox.close();
}

function uiChatBoxCloseBoard() {
    UIChatBox.closeBoard();
}

function uiChatBoxCloseKeyboard() {
    UIChatBox.closeKeyboard();
}

//扩展功能按钮
function uiChatBoxExtras() {
    var extras = {
        titleSize: 10,
        titleColor: '#a3a3a3',
        btns: [{
            title: '图片',
            normalImg: BASE_CHATBOX_PATH + '/album.png'
        }, {
            title: '拍摄',
            normalImg: BASE_CHATBOX_PATH + '/camera.png'
        }, {
            title: '短视频',
            normalImg: BASE_CHATBOX_PATH + '/send_video.png'
        }, {
            title: '位置',
            normalImg: BASE_CHATBOX_PATH + '/location.png'
        }]
    };
    //从缓存中读取自定义表情
    //selfEmotions=$api.getStorage('selfEmotions');
    //// console.log('selfEmotions:'+JSON.stringify(selfEmotions));
    //if (selfEmotions) {
    //  for (var i = 0; i < selfEmotions.length; i++) {
    //      //展示本地缓存图片
    //      if(selfEmotions[i].indexOf('|')>0)
    //        extras.btns.push({normalImg:selfEmotions[i].split('|')[1]});
    //  }
    //}
    ////添加自定义表情按钮
    //extras.btns.push({
    //    title: '自定义表情',
    //    normalImg: BASE_CHATBOX_PATH + '/emotion.png'
    //});
    //console.log('extras:'+JSON.stringify(extras));
    return extras;
}
//输入框监听事件
function uiChatBoxListener() {
    //加载录音按钮事件
    /**
     press（按下录音按钮）
     press_cancel（松开录音按钮）
     move_out（按下录音按钮后，从按钮移出）
     move_out_cancel（按下录音按钮后，从按钮移出并松开按钮）
     move_in（move_out事件后，重新移入按钮区域）
     */
    UIChatBox.addEventListener({
        target: 'recordBtn',
        name: 'press'
    }, function (ret, err) {
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '正在录音...',
            text: '上划可取消录音！',
            modal: false
        });
        //开始录音
        startRecord();
    });
    //（松开录音按钮）
    UIChatBox.addEventListener({
        target: 'recordBtn',
        name: 'press_cancel'
    }, function (ret, err) {
        $api.toast("录音结束！");
        stopRecord();
    });
    //move_out（按下录音按钮后，从按钮移出）
    UIChatBox.addEventListener({
        target: 'recordBtn',
        name: 'move_out'
    }, function (ret, err) {
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '正在录音...',
            text: '移回继续录音！',
            modal: false
        });
    });
    //move_out_cancel（按下录音按钮后，从按钮移出并松开按钮）
    UIChatBox.addEventListener({
        target: 'recordBtn',
        name: 'move_out_cancel'
    }, function (ret, err) {
        $api.toast("取消录音！");
        api.stopRecord(function (ret, err) {
            if (ret) {
                removefile(ret.path);
            }
        });
    });
    //move_in（move_out 事件后，重新移入按钮区域）
    UIChatBox.addEventListener({
        target: 'recordBtn',
        name: 'move_in'
    }, function (ret, err) {
        api.showProgress({
            style: 'default',
            animationType: 'fade',
            title: '正在录音...',
            text: '继续录音！',
            modal: false
        });
    });
    //输入框绑定
    /**
     *
     move（输入框所在区域弹动事件）
     change（输入框所在区域高度改变）
     showRecord（用户点击左侧语音按钮）
     showEmotion（用户点击表情按钮）
     showExtras（用户点击右侧附加功能按钮，如果 open 时传了 extras 参数才会有此回调）
     */
        //move（输入框所在区域弹动事件）  就是输入框收起和弹出变化
    UIChatBox.addEventListener({
        target: 'inputBar',
        name: 'move'
    }, function (ret, err) {
        //                 api.toast({msg:JSON.stringify(ret),location: 'top'}); //50
        //                          api.toast({msg: JSON.stringify(err),location: 'middle'});//283
        //点击输入框时会话界面高度发生变化
        setChatFrameByInputMove(ret.inputBarHeight, ret.panelHeight);
    });

    //change（输入框所在区域高度改变）
    UIChatBox.addEventListener({
        target: 'inputBar',
        name: 'change'
    }, function (ret, err) {
        //点击输入框时会话界面高度发生变化
        setChatFrameByInputChange(ret.inputBarHeight, ret.panelHeight);
    });
}

//处理功能按钮点击事件
function uiChatBoxEventHandler(extraIndex) {
    //关闭扩展面板
    uiChatBoxCloseBoard();
    switch (extraIndex) {
        case 0:
            //相册选
            getAlbum();
            // getPicture("album");
            break;
        case 1:
            //现在照
            getPicture("camera");
            break;
        case 2:
            //选择录像
            //openWinPro('video_win');
            api.toast({
                msg: '此功能暂未开放',
                duration: 2000,
                location: 'middle'
            });
            break;
        case 3:
            //位置
            openWinPro('location_win');
            break;
        default:
            // var selfEmotions=$api.getStorage("selfEmotions");
            var emotionlength = selfEmotions ? selfEmotions.length : 0;
            if (extraIndex < 8 + emotionlength) {
                var imgurl = selfEmotions[extraIndex - 8].split('|')[0];
                sendEmotion(imgurl);
            } else {
                // 自定义表情管理
                toast("升级中，暂未开放");
                //openWinPro('emotion_list');
            }
    }
}
/*将文字中的表情符号翻译成图片，并可自定义图片尺寸*/
function transText(text, imgWidth, imgHeight) {
    //console.log('emotionData:'+JSON.stringify(emotionData));
    var imgWidth = imgWidth || 20;
    var imgHeight = imgHeight || 20;
    var regx = /\[(.*?)\]/gm;
    var textTransed = text.replace(regx, function (match) {
        var imgSrc = emotionData[match];
        if (!imgSrc) {
            //说明不对应任何表情，直接返回
            return match;
        }
        var img = "<img src=" + imgSrc + " width=" + imgWidth + " height=" + imgHeight + ">";
        return img;
    });
    textTransed = transferBr(textTransed);
    return textTransed;
}

function setChatFrameByInputMove(inputBarHeight, panelHeight) {
    if (inputBarHeight > 0) { //输入框打开时
        api.setFrameAttr({
            name: 'trading_index_online_frame',
            rect: {
                x: 0,
                y: header_h,
                w: api.winWidth,
                h: api.winHeight - header_h - inputBarHeight - panelHeight,
            },
        });

    } else { //关闭时
        api.setFrameAttr({
            name: 'trading_index_online_frame',
            rect: {
                x: 0,
                y: header_h,
                w: api.winWidth,
                h: api.winHeight - header_h - inputBarHeight - 35,
            },
        });

        closeKeyBoard();
    }
    setTimeout('goBottom()', 200);
}
function setChatFrameByInputChange(inputBarHeight, panelHeight) {
    api.setFrameAttr({
        name: 'trading_index_online_frame',
        rect: {
            x: 0,
            y: header_h,
            w: api.winWidth,
            h: api.winHeight - header_h - inputBarHeight - panelHeight - 35,
        },
    });
    setTimeout('goBottom()', 200);
}
function startRecord() {
    //先删除再录音
    api.stopRecord(function (ret, err) {
        if (ret) {
            removefile(ret.path);
        }
    });
    //点击后播放开启录音的声音
    api.startPlay({
        path: 'widget://res/LowBattery.mp3'
    }, function () {
        api.startRecord();
    });
}
//删除文件
function removefile(path) {
    var fs = api.require('fs');
    fs.remove({
        path: path
    }, function (ret, err) {
    });
}
//结束录音
function stopRecord() {
    api.stopRecord(function (ret, err) {
        if (ret) {
            if (ret.duration == 0 || ret.duration < 1) {
                removefile(ret.path);
            } else if (ret.duration > 60) {
                api.toast({
                    msg: '最多只允许60秒',
                    duration: 2000,
                    location: 'middle'
                });
                removefile(ret.path);
            } else {
                api.sendEvent({
                    name: 'setVoice',
                    extra: {
                        voice_result: ret,
                        conver_type: conver_type
                    }
                });
            }
        }
    });
}
function goBottom() {
    document.getElementsByTagName('body')[0].scrollTop = document.getElementsByTagName('body')[0].scrollHeight;
}
