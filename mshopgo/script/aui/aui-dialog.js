/**
 * aui-popup.js
 * @author 流浪男
 * @todo more things to abstract, e.g. Loading css etc.
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function( window, undefined ) {
    "use strict";
    var auiDialog = function() {
    };
    var isShow = false;
    auiDialog.prototype = {
        params: {
            title:'',
            msg:'',
            buttons: ['取消','确定'],
            input:false
        },
        create: function(params,callback) {
        	var self = this;
            var dialogHtml = '';
            var buttonsHtml = '';
            var headerHtml = params.title ? '<div class="aui-dialog-header " style="position: relative">' + params.title + '<span style="position:absolute;top:0.6rem;right:0.2rem;width: 0.1rem;margin-right: 1.5rem;"><i class="aui-iconfont aui-icon-close ddd-icon-close aui-dialog-close" style="font-size:1rem;width: 1rem "></i></span></div>' : '<div class="aui-dialog-header ">' + self.params.title + '<span style="position:absolute;top:0.6rem;right:0.2rem;width: 0.1rem;margin-right: 1.5rem;"><i class="aui-iconfont aui-icon-close ddd-icon-close aui-dialog-close"  style="font-size:1rem;width: 1rem "></i></span></div>';
            if(params.input){
                params.text = params.text ? params.text: '';
                var msgHtml = '<div class="aui-dialog-body"><input type="text" placeholder="'+params.text+'"></div>';
            }else{
                var msgHtml = params.msg ? '<div class="aui-dialog-body" style="margin: 1rem 0;">' + params.msg + '</div>' : '<div class="aui-dialog-body">' + self.params.msg + '</div>';
            }
            var buttons = params.buttons ? params.buttons : self.params.buttons;
            if (buttons && buttons.length > 0) {
                for (var i = 0; i < buttons.length; i++) {
                    if (i == 0 ) {

                        buttonsHtml += '<div class="aui-dialog-btn " style="color:#999;" tapmode button-index="'+i+'">'+buttons[i]+'</div>';
                    } else {
                        buttonsHtml += '<div class="aui-dialog-btn " tapmode button-index="'+i+'">'+buttons[i]+'</div>';
                    }
                }
            }
            var footerHtml = '<div class="aui-dialog-footer">'+buttonsHtml+'</div>';
            dialogHtml = '<div class="aui-dialog">'+headerHtml+msgHtml+footerHtml+'</div>';
            document.body.insertAdjacentHTML('beforeend', dialogHtml);
            // listen buttons click
            var dialogButtons = document.querySelectorAll(".aui-dialog-btn");
            if(dialogButtons && dialogButtons.length > 0){
                for(var ii = 0; ii < dialogButtons.length; ii++){
                    dialogButtons[ii].onclick = function(){
                        if(callback){
                            if(params.input){
                                callback({
                                    buttonIndex: parseInt(this.getAttribute("button-index"))+1,
                                    text: document.querySelector("input").value
                                });
                            }else{
                                callback({
                                    buttonIndex: parseInt(this.getAttribute("button-index"))+1
                                });
                            }
                        };
                        self.close();
                        return;
                    }
                }
            }

            var dialogCloseButtons = document.querySelectorAll(".aui-dialog-close");
            if (dialogCloseButtons && dialogCloseButtons.length > 0) {
                for(var ii = 0; ii < dialogCloseButtons.length; ii++){
                    dialogCloseButtons[ii].onclick = function(){
                        // api.sendEvent({
                        //     name: 'game_data_reload',
                        //     extra: {
                        //         msg: '数据刷新',
                        //         pageName:api.pageParam.pageName
                        //     }
                        // });
                        self.close();
                        return;
                    }
                }
            }

            self.open();
        },
        open: function(){
            if(!document.querySelector(".aui-dialog"))return;
            var self = this;
            document.querySelector(".aui-dialog").style.marginTop =  "-"+Math.round(document.querySelector(".aui-dialog").offsetHeight/2)+"px";
            if(!document.querySelector(".aui-mask")){
                var maskHtml = '<div class="aui-mask"></div>';
                document.body.insertAdjacentHTML('beforeend', maskHtml);
            }
            // document.querySelector(".aui-dialog").style.display = "block";
            setTimeout(function(){
                document.querySelector(".aui-dialog").classList.add("aui-dialog-in");
                document.querySelector(".aui-mask").classList.add("aui-mask-in");
                document.querySelector(".aui-dialog").classList.add("aui-dialog-in");
            }, 10)
            document.querySelector(".aui-mask").addEventListener("touchmove", function(e){
                e.preventDefault();
            })
            document.querySelector(".aui-dialog").addEventListener("touchmove", function(e){
                e.preventDefault();
            })
            return;
        },
        close: function(){
            var self = this;
            document.querySelector(".aui-mask").classList.remove("aui-mask-in");
            if (document.querySelector(".aui-dialog")) {
                document.querySelector(".aui-dialog").classList.remove("aui-dialog-in");
                document.querySelector(".aui-dialog").classList.add("aui-dialog-out");
            }

            if (document.querySelector(".aui-dialog:not(.aui-dialog-out)")) {
                setTimeout(function(){
                    if(document.querySelector(".aui-dialog"))document.querySelector(".aui-dialog").parentNode.removeChild(document.querySelector(".aui-dialog"));
                    self.open();
                    return true;
                },200)
            }else{
                document.querySelector(".aui-mask").classList.add("aui-mask-out");
                if (document.querySelector(".aui-dialog")) {
                    document.querySelector(".aui-dialog").addEventListener("webkitTransitionEnd", function(){
                        self.remove();
                    })
                    document.querySelector(".aui-dialog").addEventListener("transitionend", function(){
                        self.remove();
                    })
                }

            }
        },
        remove: function(){
            if(document.querySelector(".aui-dialog"))document.querySelector(".aui-dialog").parentNode.removeChild(document.querySelector(".aui-dialog"));
            if(document.querySelector(".aui-mask")){
                document.querySelector(".aui-mask").classList.remove("aui-mask-out");
            }
            return true;
        },
        alert: function(params,callback){
        	var self = this;
            return self.create(params,callback);
        },
        prompt:function(params,callback){
            var self = this;
            params.input = true;
            return self.create(params,callback);
        }
    };
	window.auiDialog = auiDialog;
})(window);
