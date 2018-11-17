var pageParam=function () {
        var paramStr=decodeURI(window.location.search).slice(1);
        var paramObj={};
        for(var i=0;i<paramStr.split("&").length;i++){
            paramObj[paramStr.split("&")[i].split("=")[0]]=paramStr.split("&")[i].split("=")[1];
        }
        return paramObj;
    }
