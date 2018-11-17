var aa= window.innerWidth;
document.getElementsByTagName('html')[0].setAttribute("style","font-size:"+aa/1920*100+"px");
window.onresize=function(){
    var aa= window.innerWidth;
    document.getElementsByTagName('html')[0].setAttribute("style","font-size:"+aa/1920*100+"px");};
