/**
 * Created by Administrator on 2018/1/16.
 * 封装 api 原生操作方法到 $a 对象上，调用为 $a.method
 */

(function (window) {
    var a = {};
    /*返回检测的类型*/
    a.type = function (e) {
        return null == e ? (e + '') : (
            typeof e == "object" ? (this.toString.call(e).toLocaleLowerCase().substr(8).split(']')[0]) : (typeof e)
        )
    }
    /*是否为json对象*/
    a.isJSON = function (obj) {
        return 'object' === a.type(obj) && !obj.length;
    }
    /**
     * 获取页面传递参数
     * @param str 默认 'pageParam'
     * @returns {json}
     */
    a.getParam = function (str) {
        str = typeof str === 'string' ? (str) : ('pageParam');
        return api[str];
    }
    /**
     * 字符串转JSON对象
     * @param str 'key:val,key2:val2'
     * @returns {{}}
     */
    a.strToJson = function (str) {
        var data = {};
        if (typeof str === 'string' && (str.indexOf(':') > -1 || str.indexOf(',') > -1)) {
            var arr = str.split(','), len = arr.length, i = 0;
            for (; i < len; i++) {
                var pos = arr[i].indexOf(':');
                data[arr[i].substr(0, pos)] = arr[i].substr(pos + 1);
            }
        }
        return data;
    }

    /*获取字符串 url 中的文件名作为window name参数*/
    a.getPageName = function (str) {
        return 'string' === typeof  str && str.lastIndexOf('/') > -1 ? (str.substr(str.lastIndexOf('/') + 1)) : (str);
    }

    /* APP打开窗口默认配置参数 */
    var options = {
        /* 打开 window 的默认参数 */
        win: {
            name: '',
            url: '',
            pageParam: '',
            bgColor: '',
            scrollToTop: true,
            slidBackEnabled: true,
            slidBackType: 'edge',
            /*默认动画*/
            animation: {
                type: 'none',
                subType: 'from_right',
                duration: 200
            }
        },
        /* 打开 frame 的默认参数 */
        frm: {
            name: '',
            url: '',
            pageParam: '',
            hScrollBarEnabled: false,
            rect: {x: 0, y: 0, w: 'auto', h: 'auto'},
            animation: {
                type: 'none',
                subType: 'from_right',
                duration: 200
            }
        },
        /* 打开一组 frame 页面的默认参数 */
        group: {
            name: '',
            scrollEnabled: false,
            rect: {x: 0, y: 0, w: 'auto', h: 'auto'},
            frames: []
        }
    }

    /*--------  api 窗口系统  --------*/

    /*打开 window 和 frame 的默认参数 */
    getDefult = function (type, url, param, json) {
        var option = options[type || 'win'];
        if (type !== 'group') {
            option['name'] = a.getPageName(url);
            option['url'] = url + '.html';
            option['pageParam'] = a.isJSON(param) ? param : ( typeof param === 'string' && a.strToJson(param) || {} );
        } else {
            option['name'] = a.type(url) === 'string' ? (url) : ('group');
            option['frames'] = a.type(param) === 'array' ? (param) : ([]);
        }
        if (json && a.isJSON(json)) {
            for (var key in json) {
                option[key] = json[key];
            }
        }
        return option;
    }
    /*关闭页面的通用方法*/
    closeDef = function (str, name) {

        return typeof name === 'string' ? (api['close' + str]({name: name})) : (api['close' + str]());
    }

    /**
     * 打开 window 页面
     * @param url    目标页面 string
     * @param param  页面参数 json || string
     * @param json   扩展参数
     */
    a.openWin = function (url, param, json) {
        var option = getDefult('win', url, param, json);
        api.openWin(option);
    }
    /*关闭window*/
    a.closeWin = function (name) {
        closeDef("Win", name);
    //#110 增加监听刷新事件
        api.sendEvent({
            name: 'reloaddata'
        });
    }
    /*关闭到指定 window*/
    a.closeToWin = function (name) {
        closeDef("ToWin", name);
    }
    /*打开frame页面*/
    a.openFrm = function (url, param, json) {
        var option = getDefult('frm', url, param, json);
        api.openFrame(option);
    }
    /*关闭frame页面*/
    a.closeFrm = function (name) {
        closeDef("Frame", name);
    }
    /**
     * 打开 一组 frame 页面
     * @param name    frame 组名字
     * @param frames  frame 数组
     * @param json    扩展参数
     * @param callback  加载完成的回调函数
     */
    a.openFrmGop = function (name, frames, json, callback) {
        var option = getDefult('group', name, frames, json);
        api.openFrameGroup(option, (a.type(callback) === 'function' ? (callback) : (function (ret, err) {
            console.log(ret)
        })));
    }
    /* 关闭frameGroup */
    a.closeFrmGop = function (name) {
        closeDef('FrameGroup', name || 'group');
    }

    /*--------  api 网络通信  --------*/

    /**
     *  api 原生ajax请求方法的封装
     * @param url   接口请求地址
     * @param data  接口没参数 data 可以是回调
     * @param callBack 请求接口的回调函数
     */
    a.ajax = function (url, data, callback) {
        arguments.length == 2 && typeof data === 'function' ? (api.ajax({
                url: url,
                method: 'post',
                data: {values: {}}
            }, function (res, err) {
                data(res, err)
            })

        ) : (
            api.ajax({
                url: url,
                method: method || 'post',
                data: {values: data}
            }, function (res, err) {
                callback(res, err)
            })
        );
    }

    /* 图片本地缓存 */
    a.imgCache = function (url, callback) {
        api.imageCache({url: url}, function (ret, err) {
            callback(ret, err);
        });
    }

    /*--------  api 消息事件  --------*/

    /**
     * 添加页面监听事件
     * @param name  自定义事件名称 或者 json对象
     * @param callback 事件触发时的回调函数
     * @returns {*}
     */
    a.addEvt = function (name, callback) {
        name = a.isJSON(name) ? (name) : (a.type(name) === 'string' ? ({'name': name}) : (false));
        return name && api.addEventListener(name, callback);
    }

    /*触发页面事件*/
    a.sendEvt = function (name, extra) {
        extra = a.isJSON(extra) ? (extra) : (a.strToJson(extra));
        api.sendEvent({name: name, extra: extra});
    }

    /*移除页面事件*/
    a.removeEvt = function (name) {
        api.removeEventListener({name: name});
    }

    /*--------  api 设备访问  --------*/

    /* 获取设备位置信息 */
    a.getLocal = function (callback) {
        api.getLocation(callback);
    }

    /*调用拨打打电话功能*/
    a.callPhone = function (number, type) {
        api.call({type: type || 'tel_prompt', number: !isNaN(number) ? number : '10086'});
    }

    /**
     * 发送短信
     * @param number 字符串号码
     * @param text   字符串内容
     * @param callback  发送完的回调函数
     */
    a.sendTxt = function (number, text, callback) {
        api.sms({
            numbers: [number],
            text: text
        }, callback || function (ret, err) {
                console.log(ret)
            });
    }

    /* 打开手机通讯录选择联系人 */
    a.openContacts = function (callback) {
        api.openContacts(callback);
    }

    /* 设置是否全屏显示 */
    a.setFullScreen = function (bool) {
        api.setFullScreen({fullScreen: !!bool});
    }

    /*设置手机状态栏样式*/
    a.setStatusBarStyle = function (style, bgcolor) {
        api.setStatusBarStyle({
            style: style || 'light', color: bgcolor || "#000"
        });
    }

    /*--------  api UI组件  --------*/

    /* alert 弹框 */
    a.alert = function (title, msg, callBack) {
        api.alert({
            title: title || '弹框标题',
            msg: msg || '弹框内容',
        }, callBack);
    }
    /* confirm 弹框 */
    a.confirm = function (title, msg, btns, callBack) {
        api.confirm({
            title: title || '弹框标题',
            msg: msg || '弹框内容',
            buttons: btns || ['确定', '取消']
        }, callBack);
    }
    /* 消息提示弹框 */
    a.toast = function (msg, time, location) {
        api.toast({
            msg: msg || '消息提示',
            duration: time || 2000,
            location: location || 'middle'
        });
    }

    window.$a = a;
})(window);

/*------------ 常用的全局函数 ------------*/

/**
 *  初始化横向导航条
 * @param id        滚动条的外层 '#id'
 * @param callback  点击导航条的回调函数 (target 点击对象)
 * @param w         下划线的宽度 ,不配置默认内容宽度
 * @returns {*|IScroll}
 */
function initNavScroll(id, callback, w) {
  var myScroll = new IScroll(id, {
        scrollX: true,
        tap: true,
        /*下滑线的宽度*/
        lineW: w || '',
        /*初始化下划线位置*/
        init_line: function (options) {
            var active = $api.dom('#iscroll .con-item.active'), w = options.lineW || '';
            if (w && !isNaN(w)) {
                var left = Number(active.offsetLeft)+((active.offsetWidth-w)/2);
                $api.css($api.byId('line'), "left: " + left + "px;width:" + w + 'px;');
            } else {
                if (active) {   
                // #110 判断offset                 
                $api.css($api.byId('line'), "left: " + active.offsetLeft + "px;width:" + active.offsetWidth + 'px;');
                }else{
                $api.css($api.byId('line'), "left:0px;width:0px;");
                }
            }
        },
        /*点击事件的回调函数*/
        callBack: function (self, target) {
            if ($api.hasCls(target, 'active')) {
                return;
            }
            var eLis = $api.domAll('#iscroll .con-item'), index = 0,w = self.options.lineW || '';
            for (var i = 0, len = eLis.length; i < len; i++) {
                if (eLis[i] == target) {
                    $api.addCls(target, 'active');
                    index = i;
                } else {
                    $api.removeCls(eLis[i], 'active');
                }
            }
            //临时加的，不知道为什么会触发除li之外的点击
            if(index==0){
                $api.addCls(eLis[0], 'active');
            }
            if( w && !isNaN(w)){
                var left = Number(eLis[index].offsetLeft)+((eLis[index].offsetWidth-w)/2);
                $api.css($api.byId('line'), 'left:' + left + 'px; width:' + w + 'px;');
            }else{
                if (eLis[index]) {
                    // #110 判断offset
                $api.css($api.byId('line'), 'left:' + eLis[index].offsetLeft + 'px; width:' + eLis[index].offsetWidth + 'px;');                    
                }else{
                $api.css($api.byId('line'), 'left:0px; width:0px;');                                        
                }
            }
            self.scrollToElement(eLis[index], 300, true);
            callback && callback(target);
        }
    });
    myScroll.scrollToElement($api.dom('#iscroll .con-item.active'), 300, true);
    return myScroll;
}

/* 输出调试信息 */
function echo(obj) {
    var tmp = JSON.stringify(obj);
    console.log(tmp);
    return tmp;
}
//yyyy-MM-dd
function formatTime(t){
    var y = t.getFullYear();
    var m = t.getMonth() + 1;
    var d = t.getDate();
    if (m < 10) {
        m = "0" + m;
    }
    if (d < 10) {
        d = "0" + d;
    }
    var time = y + "-" + m + "-" + d;
    return time;
}
function openqrScanner() {
    var qrScanner = api.require('qrScanner');
    qrScanner.openScanner(function (ret) {
        if (ret) {
            // var str = "shopgo:url(/goods/goods_win)param({"id":"3","movebuy":"true"})"; 移动店铺商品//返回格式参考，务必参照此格式生成二维码

            var verify = /shopgo/;
            if (verify.test(ret.data)) {
                var re = /url\((.+?)\)param\((.+?)\)/g;//返回数字[1]是url，[2]是参数
                var m = re.exec(ret.data);
                api.openWin({
                    name: m[1],
                    url: '..' + m[1] + '.html',
                    pageParam: JSON.parse(m[2])
                });
            }else{
                $a.toast("请在微信端扫描");
            }
        }
    });
}