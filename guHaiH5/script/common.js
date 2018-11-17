/**
 * Created by Administrator on 2017/11/27.
 * 交易大盘项目 公共模块方法
 * project common model method
 */

/**
 * 获取页面传值的参数，返回json 或 false
 * @returns {boolean}
 */
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
      } catch (e) {
      }
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
  }, function (ret, err) {
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
      type: "none",                //动画类型（详见动画类型常量）
      subType: "from_left",       //动画子类型（详见动画子类型常量）
      duration: 360                //动画过渡时间，默认300毫秒
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
    }, function (res, err) {
      data(res, err)
    })
  ) : (
    api.ajax({
      url: url,
      method: method || 'post',
      data: {
        values: data
      }
    }, function (res, err) {
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
  api.clearCache(function () {
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
  $api.prepend(header, '<div id="statusbar" style="width:100%;height:' + statusBarHeight + ';background-color:' + (statusbarBgColor ? statusbarBgColor : "#de3232") + '"></div>');
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
    window.onscroll = function () {
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
  if (target == 'message_friends_list') {
    api.toast({
      msg: '功能升级中，暂未开放',
      duration: 2000,
      location: 'middle'
    });
    return;
  }
  
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
      subType: "from_right",
      duration: 300
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
//数组最小值
Array.prototype.min = function() {
    var min = parseFloat(this[0]);
    var len = this.length;
    for (var i = 1; i < len; i++){
        if (parseFloat(this[i]) < min){
            min = parseFloat(this[i]);
        }
    }
    return min;
}