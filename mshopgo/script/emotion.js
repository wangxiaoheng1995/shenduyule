//打开聊天框
var UIChatBox;
function openUIChatBox() {
    UIChatBox = api.require('UIChatBox');
    UIChatBox.open({
        placeholder: '',
        maxRows: 4,
        emotionPath: 'widget://res/img/emotion',
        texts: {
            recordBtn: {
                normalTitle: '按住说话',
                activeTitle: '松开结束'
            },
            sendBtn: {
                title: '发送'
            }
        },
        styles: {
            inputBar: {
                borderColor: '#d9d9d9',
                bgColor: '#ebebeb'
            },
            inputBox: {
                borderColor: '#B3B3B3',
                bgColor: '#FFFFFF'
            },
            // emotionBtn: {
            //     normalImg: 'widget://res/img/chatBox_face1.png'
            // },
            extrasBtn: {
                normalImg: 'widget://res/img/chatBox_add1.png'
            },
            // keyboardBtn: {
            //     normalImg: 'widget://res/img/chatBox_key1.png'
            // },
            // speechBtn: {
            //     normalImg: 'widget://res/img/chatBox_key1.png'
            // },
            recordBtn: {
                normalBg: '#c4c4c4',
                activeBg: '#999999',
                color: '#000',
                size: 14
            },
            indicator: {
                target: 'both',
                color: '#c4c4c4',
                activeColor: '#9e9e9e'
            },
            sendBtn: {
                titleColor: '#fff',
                bg: '#4cae4c',
                activeBg: '#5cb85c',
                titleSize: 14
            }
        },
        extras: {
            titleSize: 10,
            titleColor: '#a3a3a3',
            btns: [{
                title: '图片',
                normalImg: 'widget://res/img/chatBox_album1.png',
                activeImg: 'widget://res/img/chatBox_album2.png'
            }, {
                title: '拍照',
                normalImg: 'widget://res/img/camera.png',
                activeImg: 'widget://res/img/camera.png'
            }]
        }
    }, function(ret, err) {
        if (ret) {
            if (ret.eventType == 'send') {
                //用户点击发送按钮
                sendTextMessage(ret.msg);
            } else if (ret.eventType == 'clickExtras') {
                //用户点击附加功能面板内的按钮
                if (ret.index == 0) {

                } else if (ret.index == 1) {

                }
            } else if (ret.eventType == 'show') {
                //该模块打开成功
                //监听 recordBtn 按钮
                UIChatBox.addEventListener({
                    target: 'recordBtn',
                    name: 'move_out_cancel'
                }, function(ret, err) {
                    console.log(JSON.stringify(ret));
                });
            }
        } else {
            alert(JSON.stringify(err));
        }
    });
    uiChatBoxListener();
};

//输入框监听事件
function uiChatBoxListener() {
    UIChatBox.addEventListener({
        target: 'inputBar',
        name: 'move'
    }, function(ret, err) {
        setChatFrameByInputMove(ret.inputBarHeight, ret.panelHeight);
    });
    //change（输入框所在区域高度改变）
    UIChatBox.addEventListener({
        target: 'inputBar',
        name: 'change'
    }, function(ret, err) {
        //点击输入框时会话界面高度发生变化
        setChatFrameByInputChange(ret.inputBarHeight, ret.panelHeight);
    });
}

//监听输入框距离底部弹动的高度，来改变聊天对话界面的高度
function setChatFrameByInputMove(inputBarHeight, panelHeight) {
    if (inputBarHeight > 0) { //输入框打开时
        api.setFrameAttr({
            name: 'consult_frame',
            rect: {
                x: 0,
                y: headerH,
                w: api.winWidth,
                h: api.winHeight - headerH - inputBarHeight - panelHeight
            },
        });
    } else { //关闭时
        api.setFrameAttr({
            name: 'consult_frame',
            rect: {
                x: 0,
                y: headerH,
                w: api.winWidth,
                h: api.winHeight - headerH - inputBarHeight
            },
        });
        closeKeyBoard();
    }
    setTimeout('goBottom()', 200);
}
function setChatFrameByInputChange(inputBarHeight, panelHeight) {
    api.setFrameAttr({
        name: 'consult_frame',
        rect: {
            x: 0,
            y: headerH,
            w: api.winWidth,
            h: api.winHeight - headerH - inputBarHeight - panelHeight
        },
    });
    setTimeout('goBottom()', 200);
}
/**
 *滚动页面底部
 */
function goBottom() {
    document.getElementsByClassName('aui-chat')[0].scrollTop = document.getElementsByClassName('aui-chat')[0].scrollHeight;
}