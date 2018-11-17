var NewMsgListen = {};

//新消息接收通知
NewMsgListen.receive = function(){
    //监听新消息
    api.addEventListener({
        name: 'newNotice'
    }, function(ret, err) {
        $(".chat-message-tip").show();
    });
};
//聊天列表页面，新消息接收通知
NewMsgListen.chatListReceive = function(){
    api.addEventListener({
        name: 'newNotice'
    }, function(ret, err) {
        var message = ret.value.message;
        var utargetId = message.targetId;
        var tmpNum = parseInt($('#t'+utargetId).find('.aui-badge').text())+1;
        $('#t'+utargetId).find('.aui-badge').text(tmpNum);
        $('#t'+utargetId).find('.aui-badge').show();
        $('#t'+utargetId).find('.aui-list-item-right').text(timestampToTime(message.sentTime));
        if(message.objectName == 'RC:TxtMsg'){
            $('#t'+utargetId).find('.aui-card-list-user-info').text(message.content.text);
        }else if(message.objectName == 'RC:ImgMsg'){
            $('#t'+utargetId).find('.aui-card-list-user-info').text('【图片】');
        }
    });
};
//聊天对话页面，新消息接收通知
NewMsgListen.chatWinReceive = function(){
    api.addEventListener({
        name: 'newNotice'
    }, function(ret, err) {
        var message = ret.value.message;
        if ("RC:TxtMsg" == message.objectName) {
            var interText = doT.template($("#data_newmessage").text());
            message.headImgUrl=targetUser.avatar;
            $("#msgList").append(interText(message));
        }else if("RC:ImgMsg" == message.objectName){
            var interText = doT.template($("#data_newmessage").text());
            message.headImgUrl=targetUser.avatar;
            $("#msgList").append(interText(message));
        }
        goBottom();
        NewMsgListen.msgReadPush(targetUser.targetId);
    });
};
//聊天对话页面，新消息发送通知
NewMsgListen.chatWinRequest = function(){
    api.addEventListener({
        name: 'newMessage'
    }, function(ret, err) {
        var message = ret.value.message;
        $api.html($api.dom(c, '.aui-img'), message.content.text);
    });
}
//消息被读取推送
NewMsgListen.msgReadPush = function(targetId){
    editNoReadNum(targetId);
    api.sendEvent({
        name: 'msgRead',
        extra: {targetId:targetId}
    });
};
//消息被读取通知
NewMsgListen.readMsg = function(){
    //监听新消息
    api.addEventListener({
        name: 'msgRead'
    }, function(ret, err) {
        NewMsgListen.getUnreadMsg();
    });
};
//聊天列表页面，消息被读取通知
NewMsgListen.chatListreadMsg = function(){
    //监听新消息
    api.addEventListener({
        name: 'msgRead'
    }, function(ret, err) {
        var utargetId = ret.value.targetId;
        $('#t'+utargetId).find('.aui-badge').text(0);
        $('#t'+utargetId).find('.aui-badge').hide();
    });
};
//查询是否有未读消息
NewMsgListen.getUnreadMsg = function () {
    getUnreadMsg(function(res){
        if(res){
            $(".chat-message-tip").show();
        }else{
            $(".chat-message-tip").hide();
        }
    });
};