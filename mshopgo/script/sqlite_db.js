/*消息类型*/
const infoType_TXT = 1;//文字
const infoType_IMG = 2;//图片
const infoType_GOODS = 3;//商品
/*消息发送接收类型*/
const sendType_REC = 1; //接收
const sendType_REP = 2; //发送


var sqname = 'shopgoshopoo',sqpath = 'fs://';
//打开数据库
var sqlite=window;
var database=null;
function dbopen() {
    database=sqlite.openDatabase(
        sqname,
        "1.0",
        sqpath + sqname + '.db',
        null,
        function(ret, err) {
        if (ret) {
            //创建数据表
            //会话列表
            var sql = "CREATE TABLE IF NOT EXISTS Message(Id INTEGER PRIMARY KEY AUTOINCREMENT,userId INTEGER,targetId INTEGER, info TEXT,infotype TINYINT,edittime Date,sendtype TINYINT);";
            dbexecuteSql(sql, function(success) {
                console.log(success);
            });
            //人员
            sql = "CREATE TABLE IF NOT EXISTS Person(Id INTEGER PRIMARY KEY AUTOINCREMENT,targetId INTEGER,name varchar(50),avatar varchar(255),lastmsg TEXT,edittime DATE,noRead INTEGER);";
            dbexecuteSql(sql, function(success) {
                var sql = "select targetId,name,avatar from Person where targetId=-100";
                dbselectSql(sql, function(data) {
                    if (data.length == 0) {
                        sql = "INSERT into Person (targetId,name,avatar,lastmsg,noRead) VALUES(-100,'拼单通知','http://media1.yunlutong.com/xpgother/msgpd.png','暂无消息',0)";
                        dbexecuteSql(sql, function(data) {});
                        sql = "INSERT into Person (targetId,name,avatar,lastmsg,noRead) VALUES(-200,'合伙人通知','http://media1.yunlutong.com/xpgother/msghhr.png','暂无消息',0)";
                        dbexecuteSql(sql, function(data) {});
                    }
                });
                console.log(success);
            });
        }
    });
}
//判断数据库是否创建
// function fsexist(callback) {
//     var fs = api.require('fs');
//     fs.exist({
//         path: sqpath + sqname + '.db'
//     }, function(ret, err) {
//         callback(ret.exist);
//     });
// }

//操作
function dbexecuteSql(sql, callback) {
    // 执行数据操作
    database.transaction(function (ctx) {
        ctx.executeSql(
            sql,
            [],
            function(ctx,result) {
                callback(true);
            },function () {
                callback(false);
        });
    })
}
//查询
function dbselectSql(sql, callback) {
    //执行数据查询
    database.transaction(function (ctx) {
        ctx.executeSql(
            sql,
            [],
            function(ctx,result) {
                callback(result.rows);
            },function (ctx,result) {
                callback(result);
            });
    })
}


//打开聊天对话页面
function openChatFromFriend(targetId,chatGoods) {
  var chatGoodData = arguments[1] ? arguments[1] : {};
    var sql = "select targetId,name,avatar from Person where targetId='" + targetId + "'";
  dbselectSql(sql, function(data) {
        if (data.length == 0) {
          getUser(function(data) {
                openChatWin(targetId,chatGoodData);
            })
        }else{
            openChatWin(targetId,chatGoodData);
        }
    })
}
function openChatWin(targetId,chatGoodData) {
    location.href='../airlines/consult_win.html?targetId='+targetId+'&chatGoodData='+JSON.stringify(chatGoodData);
}
//异步获取用户信息
function getUser(callback) {
    $.ajax({
        url: PHP_SERVE_URL + '/message/getUserInfoByUid',
        type: 'post',
        data: {
            uid: targetId,
            hashToken: yltcrypt.cpt(targetId)
        },
        success:function(ret, err) {
            console.log(ret)
            if (ret.code == 0) {
                var tmsg = "INSERT into Person (targetId,name,avatar,noRead) VALUES('"+ret.data.uid+"','"+ret.data.nick_name+"','"+ret.data.avatar+"',0)";
                dbexecuteSql(tmsg, function(data) {});
                callback(ret.data);
            }
        }
    });
}

//处理接收到的消息
function dealReciveMsg(msg,msgType,time,targetId) {
    var formatmsg = msg;
    if(msgType == infoType_IMG){
        formatmsg = '【图片】';
    }else if(msgType == infoType_GOODS){
        formatmsg = '【商品信息】';
    }
    var formatTime = timestampToTime(time);
    editUserLastMsg(targetId,formatmsg,formatTime,sendType_REC);
    if(msgType == infoType_GOODS){
        addChat(targetId,JSON.stringify(msg),msgType,formatTime,sendType_REC);
    }else{
        addChat(targetId,msg,msgType,formatTime,sendType_REC);
    }
}
//处理发送的消息
function dealSendMsg(msg,msgType,time,targetId) {
    var formatmsg = msg;
    if(msgType == infoType_IMG){
        formatmsg = '【图片】';
    }else if(msgType == infoType_GOODS){
        formatmsg = '【商品信息】';
    }
    var formatTime = timestampToTime(time);
    editUserLastMsg(targetId,formatmsg,formatTime,sendType_REP);

    if(msgType == infoType_GOODS){
        addChat(targetId,JSON.stringify(msg),msgType,formatTime,sendType_REP);
    }else{
        addChat(targetId,msg,msgType,formatTime,sendType_REP);
    }
}

//更新最新聊天记录
function editUserLastMsg(targetId,lastmsg,edittime,sendType) {
    if(sendType == sendType_REP){
        var updateDataSQL = 'UPDATE Person SET lastmsg = "'+lastmsg+'", edittime = "'+edittime+'" where targetId = '+targetId;
    }else{
        var updateDataSQL = 'UPDATE Person SET lastmsg = "'+lastmsg+'", edittime = "'+edittime+'", noRead=noRead+1 where targetId = '+targetId;
    }
    dbexecuteSql(updateDataSQL, function(success) {
        return;
    });
}
//新增聊天记录
function addChat(targetId,info,infotype,edittime,sendtype) {
    var insterTableSQL = 'INSERT INTO Message (userId,targetId,info,infotype,edittime,sendtype) VALUES ('+user.uid+','+targetId+',"'+info+'",'+infotype+',+"'+edittime+'",'+sendtype+')';
    dbexecuteSql(insterTableSQL, function(success) {
        return;
    });
}
//更新聊天记录未读数量为0
function editNoReadNum(targetId) {
    var updateDataSQL = 'UPDATE Person SET noRead=0 where targetId = '+targetId;
    dbexecuteSql(updateDataSQL, function(success) {
        return;
    });
}

//查询所有会话
function getChatUser() {
    var sql = "select * from Person order by edittime desc";
    dbselectSql(sql, function(data) {
        var interText = doT.template($("#data_conversation").text());
        $("#conversation").html(interText(data));
    });
}
//查询会话用户信息
function getTargetInfo(targetId) {
    var sql = "select targetId,name,avatar from Person where targetId='" + targetId + "'";
    dbselectSql(sql, function(data) {
        targetUser = data[0];
    })
}
//查询消息
function selectMessage(chatGoodData) {
    var offset = pageSize*pageIndex;
    var sql = "select * from Message where userId="+user.uid+" and targetId = "+targetId+" order by Id desc limit "+pageSize+" offset "+offset;
    dbselectSql(sql, function(data) {
        // data.reverse();
        var dataArr=[];
        for(var i=data.length-1;i>=0;i--){
            dataArr.push(data[i]);
        }
        var interText = doT.template($("#data_message").text());
        $("#msgList").prepend(interText({avatar:user.avatar,targetAvatar:targetUser.avatar,data: dataArr}));
        var goodsHtml = '';
        if(chatGoodData.gid && pageIndex==0){
            chatGoodData.gpic = chatGoodData.pic;
            goodsHtml += '<section class="aui-content"><div class="aui-card-list"><div class="aui-card-list-content"><ul class="aui-list aui-media-list"><li class="aui-list-item aui-list-item-middle">';
            goodsHtml += '<div class="aui-media-list-item-inner"><div class="aui-list-item-media">';
            goodsHtml += '<img src="'+chatGoodData.pic+'" class=" aui-list-img-sm">';
            goodsHtml += '</div><div class="aui-list-item-inner aui-list-item-arrow"><div class="aui-list-item-text">';
            goodsHtml += '<div class="aui-list-item-title aui-font-size-14">'+chatGoodData.gname+'</div>';
            goodsHtml += '</div><div class="aui-list-item-text">';
            goodsHtml += '<div class="aui-list-item-title aui-font-size-14 aui-text-danger">¥'+chatGoodData.price+'</div>';
            goodsHtml += '<div class="aui-btn aui-btn-danger aui-btn-outlined aui-list-item-right" onclick="sendGoodsMessage(chatGoodData,this)">咨询该商品</div>';
            goodsHtml += '</div></div></div></li></ul></div></div></section>';
            $("#msgList").append(goodsHtml);
            goBottom();
        }
        loadMoreMsg = 1;
        pageIndex++;
    });
}

//查询是否有未读消息
function getUnreadMsg(callback) {
    var sql = "select * from Person where noRead != 0 limit 1";
    dbselectSql(sql, function(data) {
        if(data.length == 0){
            callback(0);
        }else{
            callback(1);
        }
    });
}

