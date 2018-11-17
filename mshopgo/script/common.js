var rong;
function getParam() {
    if (api.pageParam && typeof api.pageParam == 'object') {
        return api.pageParam;
    } else {
        return false;
    }
}

/**
 * api 系统弹框
 * @param msg string 显示的字符串
 * @param time  时间 单位 毫秒数
 * @param seat  位置 默认居中
 */
function toast(msg, time, seat) {
    api.toast({
        msg: msg,
        duration: time || 2000,
        location: seat || 'middle'
    });
}

/**
 * api 系统弹框
 * @param msg string 显示的字符串
 * @param time  时间 单位 毫秒数
 * @param seat  位置 默认居中
 */
function setFullScreen() {
    api.setFullScreen({
        fullScreen: true
    });
}

// 取消全屏
function cancelFullScreen() {
    api.setFullScreen({
        fullScreen: false
    });
}

/**
 * 正则判断数据
 * @param val 任意类型
 * @param reg 正则表达式 默认正则 6-18位字母数字下划线
 * @returns {boolean}
 */
function checkReg(val, reg) {
    reg = (reg && reg instanceof RegExp) ? reg : /^[a-z0-9_-]{6,18}$/;
    if (reg.test(val)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 判断json对象
 * @param obj json
 * @returns {boolean}
 */
function isJson(obj) {
    return typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
}

/**
 * 打开页面
 * @param target 目标页面 string
 * @param param  页面参数 json || string '{test:test}'
 * @param anima  页面动画 json
 * @param reload 刷新页面 boolean
 */
function openWin(target, param, anima, reload) {
    if (target != api.winName) {
        if (typeof param == 'string' && param.charAt(0) == '{') {
            try {
                param = JSON.parse(param);
            } catch (e) {}
        }
        param = isJson(param) ? param : {};
        anima = isJson(anima) ? anima : {
            'type': 'push',
            'subType': 'from_right',
            'duration': 360
        };
        var name = target.indexOf('/') != -1 ? (target.split('/')[1]) : (target);
        api.openWin({
            name: name,
            url: target + '.html',
            pageParam: param,
            reload: reload || false,
            animation: anima,
            allowEdit: true,
            scrollToTop: true
        });
    } else if (target == 'root') {
        api.openWin({
            name: 'root',
            url: '../index.html'
        });
    }
}

/**
 * 添加页面事件
 * @param name 事件名称
 * @param callback 事件回调
 */
function apiListen(name, callback) {
    name = typeof name == 'string' ? name : '';
    if (name == '') {
        return toast('事件名称为字符串')
    }
    api.addEventListener({
        'name': name
    }, function(ret, err) {
        callback(ret, err)
    });
}

/**
 * 触发页面事件
 * @param name 事件名称 string
 * @param extra 触发事件传递的参数 json
 */
function apiSend(name, extra) {
    extra = isJson(extra) ? extra : {};
    api.sendEvent({
        name: name,
        extra: extra
    });
}

/**
 * 移除页面事件
 * @param name 事件名称 string
 */
function apiRmEvent(name) {
    api.removeEventListener({
        name: name
    });
}

/*关闭窗口*/
function closeWin() {
    api.closeWin({
        animation: {
            type: "none", //动画类型（详见动画类型常量）
            subType: "from_left", //动画子类型（详见动画子类型常量）
            duration: 360 //动画过渡时间，默认300毫秒
        }

    });
}

function closeToWin(winName) {
    api.closeToWin({
        name: winName
    });
}

/*打开关闭frame*/
function openFrmPro(target, keyVal) {
    if (typeof keyVal == 'string' && keyVal.charAt(0) == '{') {
        try {
            keyVal = JSON.parse(keyVal)
        } catch (e) {
            //console.log(e)
        }
    }
    keyVal = isJson(keyVal) ? keyVal : {};
    api.openFrame({
        name: target,
        url: target + ".html",
        rect: {
            x: 0,
            y: 0,
            w: 'auto', //宽度，若传'auto'，页面从x位置开始自动充满父页面宽度
            h: 'auto' //高度，若传'auto'，页面从y位置开始自动充满父页面高度
        },
        bgColor: 'rgba(0,0,0,0)',
        pageParam: keyVal
    });
}

function closeFramePro(name) {
    api.closeFrame({
        name: name
    });
}

/**
 * 公共ajax请求函数
 * @param url 接口地址 string
 * @param data 请求参数 json 格式 || 接口没参数 ,data可以是回调函数
 * @param callback 请求接口的回调 function 回调参数res后台数据，err请求发生的错误信息
 * @param method 请求方法  默认 post
 */
function apiAjax(url, data, callback, method) {
    arguments.length == 2 && typeof data == 'function' ? (
        api.ajax({
            url: url,
            method: 'post',
            data: {
                values: {}
            }
        }, function(res, err) {
            data(res, err)
        })
    ) : (
        api.ajax({
            url: url,
            method: method || 'post',
            data: {
                values: data
            }
        }, function(res, err) {
            callback(res, err)
        })
    );
}

/*输出调试信息*/
function echo(json) {
    console.log(JSON.stringify(json));
}

/*清除手机缓存*/
function clearCache() {
    api.clearCache(function() {
        api.toast({
            msg: '清除完成'
        });
    });
}

/*检测用户是否登录*/
function checkUser(user, param) {
    if (isJson(user) && user.id) {
        return true
    } else {
        openWin('trading_login', param);
    }
}

/*修复头部*/
function fix_status_bar(maxalpha, statusbarBgColor, callback, menuOpen) {
    cancelFullScreen();
    maxalpha = arguments[0] ? arguments[0] : 0.8;
    if (arguments[1])
        statusbarBgColor = arguments[1];
    api.setStatusBarStyle();
    var header = $api.dom('header');
    $api.fixStatusBar(header);
    //获取导航栏高度
    var statusBarHeight = $api.cssVal(header, 'padding-top');
    // 设置z-index值
    $api.css(header, 'z-index:10000;');
    //手机状态栏用个空的div填充，如果直接在header里面加padding,当fixed时不生效
    //$api.prepend(header, '<div id="statusbar" style="width:100%;height:'+statusBarHeight+';'+(statusbarBgColor?"background-color:"+statusbarBgColor:"")+'"></div>');
    $api.prepend(header, '<div id="statusbar" style="width:100%;height:' + 0 + ';background-color:' + (statusbarBgColor ? statusbarBgColor : "#ddd") + '"></div>');
    //固定头部(顶部留出导航位置)
    $api.css(header, 'position: fixed;padding-top:0px;');
    var headerPos = $api.offset(header);
    var bgcolor = $api.cssVal(header, 'background-color');
    //如果设置背景透明，滚动显示头部
    if (bgcolor && bgcolor.indexOf("rgba") >= 0) {
        //下面元素下移，留出导航栏
        $api.css($api.next(header), 'margin-top:' + statusBarHeight + ';');
        var bgcolorPrefix = bgcolor.substring(0, bgcolor.lastIndexOf(','));
        //界面设置的初始透明度，不得低于该值
        var alphaStart = parseFloat(bgcolor.substring(bgcolorPrefix.length + 1, bgcolor.lastIndexOf(')')));
        window.onscroll = function() {
            var t = document.documentElement.scrollTop || document.body.scrollTop;
            //透明度不得超过1，不得超过传参最大值，不得小于界面设置初始值
            var alpha = Math.max(Math.min(Math.min(t, headerPos.h) / headerPos.h, maxalpha), alphaStart);
            $api.css(header, "background-color:" + bgcolorPrefix + "," + alpha + ")");
            //回调处理
            if (callback) {
                callback(t - headerPos.h);
            }
        }
    } else {
        //下面元素下移，滚动时不超过头部位置
        if (headerPos) {
            $api.css($api.next(header), 'margin-top:' + headerPos.h + 'px;');
        }
    }
    var openMenuBool = menuOpen ? menuOpen : 1; // 默认不开启笑脸
    if (openMenuBool == 0) {
        openMenu();
    }

    // 判断是否有footer元素
    var footer = $api.dom('#footer');
    if (footer != null) {
        // 获取高度
        var footerOffsetHeight = footer.offsetHeight;
        // 获取body的margin-bottom值
        var bodyMarginBottom = parseInt($api.cssVal($api.dom('body'), 'margin-bottom'));
        $api.css($api.dom('body'), 'margin-bottom:' + (bodyMarginBottom + footerOffsetHeight) + 'px;');
    }

}

// 打开页面
// keyVal格式'key1:val1,key2:val2...'
function openWinPro(target, keyVal, reload, animation) {
    var url = target + ".html";
    if (isJson(keyVal)) {
        var pageParam = keyVal;
    } else {
        if (typeof keyVal == 'undefined' || keyVal == '') {
            var pageParam = {};
        } else {
            var paramArr = new Array(); //定义一数组
            paramArr = keyVal.split(","); //字符分割
            var pageParamStr = "{";
            for (var i = 0; i < paramArr.length; i++) {
                var kvArr = new Array();
                var colon_pos = paramArr[i].indexOf(':');
                kvArr = paramArr[i].split(":"); //字符分割
                pageParamStr += "\"" + paramArr[i].substr(0, colon_pos) + "\"" + ":" + "\"" + paramArr[i].substr(colon_pos + 1) + "\"";
                if (i != paramArr.length - 1) {
                    pageParamStr += ',';
                }
            }
            pageParamStr += "}";
            var pageParam = JSON.parse(pageParamStr);
        }

    }

    if (getTypeName(animation) == 'undefined') {
        animation = 'push'; // 默认
    }

    // 打开页面
    api.openWin({
        name: target,
        url: url,
        bounces: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        reload: reload,
        animation: {
            type: animation,
            //subType: "from_right",
            //duration: 300
        },
        pageParam: pageParam,
        allowEdit: true
    });
}

// 判断值类型,继续完善
function getTypeName(v) {
    var v_str = JSON.stringify(v);
    if (typeof v == 'object') {
        // 判断null
        if (v_str == 'null') {
            return 'null';
        }
        // 判断[]
        if (v_str.charAt(0) == '[') {
            return 'array';
        }

        // 判断{}
        if (v_str.charAt(0) == '{') {
            return 'object';
        }

        // 判断Date对象
        if (v instanceof Date) {
            return 'date';
        }

        // 其他...
        return 'other';
    } else if (typeof v == 'number') {
        // 判断NaN
        if (v_str == 'null') {
            return 'nan';
        }
        return typeof v;
    } else {
        return typeof v;
    }
}

function getJsonObjLength(jsonObj) {
    var Length = 0;
    for (var item in jsonObj) {
        Length++;
    }
    return Length;
}
//存储临时Storage
function setTmpStorage(key, val) {
    var tmpStorage = getTmpStorage();
    tmpStorage[key] = {};
    tmpStorage[key] = val;
    localStorage.setItem('tmpStorage', JSON.stringify(tmpStorage));
}
//获取临时Storage
function getTmpStorage() {
    var tmpStorage = localStorage.getItem('tmpStorage') ? JSON.parse(localStorage.getItem('tmpStorage')) : {};
    return tmpStorage;
}


//融云初始化
function ronginit() {
    rong=RongIMLib;
    user=$api.getStorage('user');
    if (!user)return;
    connect(user.uid, user.rongToken);
}
//连接到融云
function connect(uid, token) {
        rong.RongIMClient.init("ik1qhw09ipfip");
        //设置连接状态变化的监听器
        RongIMClient.setConnectionStatusListener({onChanged:function(status) {
            if (status == RongIMLib.ConnectionStatus.CONNECTED) {
                user.connected = true;
                $api.setStorage('user', user);
            }
        }});
        //设置接收消息的监听器
        RongIMClient.setOnReceiveMessageListener({onReceived:function(message) {
            //接收到的消息
            var receivemessage = message;
            if (receivemessage.objectName == 'RC:TxtMsg') {//处理文本
                //保存通知到本地
                dealReciveMsg(receivemessage.content.text,infoType_TXT,receivemessage.sentTime,receivemessage.targetId);
                //发送给frm_friendRequest显示
                // api.sendEvent({
                //     name: 'newNotice',
                //     extra: {
                //         message: receivemessage
                //     }
                // });
            }else if (receivemessage.objectName == 'RC:ImgMsg') {//处理图片
                //保存通知到本地
                dealReciveMsg(receivemessage.content.imageUrl,infoType_IMG,receivemessage.sentTime,receivemessage.targetId);
                // api.sendEvent({
                //     name: 'newNotice',
                //     extra: {
                //         message: receivemessage
                //     }
                // });
            } else {
                //将表情转换成地址
                /*getMsgToImg(receivemessage.content.text, function(msg) {
                    receivemessage.content.text = msg;
                    //保存消息到本地
                    insertMessage(receivemessage);
                    //发送给frm_chat（聊天框）显示
                    api.sendEvent({
                        name: 'newMessage',
                        extra: {
                            message: receivemessage
                        }
                    });
                })*/
            }
            //删除融云服务端数据
            rong.deleteMessages({
                messageIds: [receivemessage.messageId]
            }, function(ret, err) {
                if (ret.status == 'success') {
                }
            })
        }});
        rongConnect(token);
}

function rongConnect(token) {
    RongIMClient.connect(token, {
        onSuccess:function (userId) {
            console.log("connect success");
            //未读消息数量
            getTotalUnreadCount();
            //未读好友申请
            // getFriendRequestCout();
        },
        onError:function () {
            $.ajax({
                url: PHP_SERVE_URL + '/message/refreshRongToken',
                type: 'post',
                data: {
                    openId: user.openId,
                    hashToken: yltcrypt.cpt(user.openId)
                },
                success:function(ret, err) {
                    console.log(JSON.stringify(ret));
                    if (ret.code == 0) {
                        user.rongToken = ret.data;
                        $api.setStorage('user', user);
                        rongConnect(user.rongToken);
                    }
                }
            });
        }
    });
}

//发送文字消息
function sendTextMessage(text) {
    var msg = new RongIMLib.TextMessage({content:text,extra:{uname:user.nickName,avatar:user.avatar}});
    var conversationtype = RongIMLib.ConversationType.PRIVATE; // 单聊,其他会话选择相应的消息类型即可。
    RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
            onSuccess: function (message) {
                //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                console.log("Send successfully");
                dealSendMsg(message.content.content,infoType_TXT,message.sentTime,targetId);
                //发送给frm_mine（聊天框）显示
                if ("RC:TxtMsg" == message.objectName) {
                    var interText = doT.template($("#data_newmessage").text());
                    message.headImgUrl=user.avatar;
                    $("#msgList").append(interText(message));
                    goBottom();
                }
            },
            onError: function (errorCode,message) {
                var info = '';
                switch (errorCode) {
                    case RongIMLib.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                        info = '未知错误';
                        break;
                    case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                        info = '在黑名单中，无法向对方发送消息';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                        info = '不在讨论组中';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_GROUP:
                        info = '不在群组中';
                        break;
                    case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                        info = '不在聊天室中';
                        break;
                    default :
                        info = x;
                        break;
                }
                console.log('发送失败:' + info);
            }
        }
    );
    return;





    // rong.sendTextMessage({
    //     conversationType: 'PRIVATE',
    //     targetId: targetId,
    //     text: text,
    //     extra: {uname:user.nickName,avatar:user.avatar}
    // }, function(ret, err) {
    //     if (ret.status == 'prepare') {
    //         var message = ret.result.message;
    //         //将表情转换成地址
    //         getMsgToImg(message.content.text, function(msg) {
    //             message.content.text = msg;
    //             dealSendMsg(msg,infoType_TXT,message.sentTime,targetId);
    //             //发送给frm_mine（聊天框）显示
    //             api.sendEvent({
    //                 name: 'newMessage',
    //                 extra: {
    //                     message: message
    //                 }
    //             });
    //         })
    //     } else if (ret.status == 'success') {
    //     } else if (ret.status == 'error')
    //         api.toast({
    //             msg: 'send ' + err.code
    //         });
    // });
}
//发送商品消息
function sendGoodsMessage(goods,that) {
    rong.sendTextMessage({
        conversationType: 'PRIVATE',
        targetId: targetId,
        text: goods,
        extra: {uname:user.nickName,avatar:user.avatar,type:'goods'}
    }, function(ret, err) {
        if (ret.status == 'prepare') {
            var message = ret.result.message;
            //将表情转换成地址
            getMsgToImg(message.content.text, function(msg) {

                message.content.text = msg;
                dealSendMsg('咨询商品：【'+goods.gname+'】',infoType_TXT,message.sentTime,targetId);
                //发送给frm_mine（聊天框）显示
                message.content.text = '咨询商品：【'+goods.gname+'】';
                api.sendEvent({
                    name: 'newMessage',
                    extra: {
                        message: message
                    }
                });
            })
        } else if (ret.status == 'success') {
            $(that).parents('.aui-content').remove();
        } else if (ret.status == 'error')
            api.toast({
                msg: 'send ' + err.code
            });
    });
}

//未读消息数量
function getTotalUnreadCount() { //本地未读
    // var sql = "SELECT sum(unRead) as unRead from Conversation where userId=\"" + user.uid + "\"";
    // dbselectSql(sql, function(data) {
    //     console.log(data)
    //     if (data.item(0).unRead != "") {
    //         var unread = data.item(0).unRead * 1;
    //         $api.text($api.dom('.noticeNum'), unread);
    //     }
    // })
}

//缓存图片到本地
function imageCache(url) {
    //缓存图片到本地
    api.imageCache({
        url: url
    }, function(ret, err) {
        if (!ret.status) {
            console.log(JSON.stringify(err));
        }
    });
}
//下载文件到本地
function download(url, callback) {
    //下载文件到本地
    var suffix = url.substring(url.lastIndexOf('.'), url.length)
    api.download({
        url: url,
        savePath: 'fs://floder/' + Date.parse(new Date()) + suffix,
        report: true,
        cache: true,
        allowResume: true
    }, function(ret, err) {
        if (ret.state == 1) {
            //下载成功
            console.log(JSON.stringify(ret));
            callback(ret.savePath);
        } else {

        }
    });
}
var reg = /\[.+?\]/g;
//转换消息中的表情
function getMsgToImg(text, callback) {
    getImgsPaths(function(emotion) {
        var zs = text.replace(reg, function(a, b) {
            return emotion[a] ? "<img src=\"" + emotion[a] + "\">" : a;
        });
        callback(zs);
    });
}
//获取表情路径
function getImgsPaths(callback) {
    api.readFile({
        path: "widget://res/img/emotion/emotion.json"
    }, function(ret, err) {
        if (ret.status) {
            var emotionArray = JSON.parse(ret.data);
            var emotion = {};
            for (var idx in emotionArray) {
                var emotionItem = emotionArray[idx];
                var emotionText = emotionItem["text"];
                var emotionUrl = "../../res/img/emotion/" + emotionItem["name"] + ".png";
                emotion[emotionText] = emotionUrl;
            }
            callback(emotion);
        }
    });
}
//时间戳转换为日期
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = date.getMonth()+1 + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y+M+D+h+m+s;
}