function H5() {
    this.getStorage=function (key) {
        return localStorage.getItem(key);
    };
    this.setStorage=function (key,value) {
        return localStorage.setItem(key,value);
    };
    this.pageParam=function () {
        var paramStr=decodeURI(window.location.search).slice(1);
        var paramObj={};
        for(var i=0;i<paramStr.split("&").length;i++){
            paramObj[paramStr.split("&")[i].split("=")[0]]=paramStr.split("&")[i].split("=")[1];
        }
        return paramObj;
    }
}
window.H5=new H5();