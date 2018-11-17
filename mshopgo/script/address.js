// JW.islogin('userData');
var userData = getUserData();
var rback;
var JW;
var toast = new auiToast({
})
window.onload = function () {
    // urlArgs = api.pageParam;
    var pageParam=H5.pageParam()
    urlArgs = !pageParam.pageParam?{}:pageParam.pageParam;
    // alert(urlArgs)
    rback = urlArgs['back'] ? 1 : 0;
    JW = {
        ajax: function (url, data, callback) {
            var url = PHP_SERVE_URL + url;
            $.ajax({
                url: url,
                data: data,
                type: 'post',
                dataType: 'json',
                success: function (res) {
                    // console.log(res);
                    callback(res)
                }, error: function () {
                    console.log('error')
                }
            })
        },
        cajax: function (url, data, callback) {
            var url = PHP_SERVE_URL + url;
            $.ajax({
                url: url,
                data: data,
                type: 'post',
                dataType: 'json',
                success: function (res) {
                    // console.log(res);
                    callback(res)
                }, error: function () {
                    console.log('error')
                }
            })
        },
        /*读写storage*/
        setData: function (key, obj) {
            if (obj !== undefined) {
                if (typeof key !== 'string') {
                    key = key.toString();
                }
                if (typeof obj === 'object') {
                    obj = JSON.stringify(obj);
                }
                localStorage.setItem(key, obj);
                return;
            } else {
                var data;
                try {
                    var obj = localStorage.getItem(key);
                    data = JSON.parse(obj)
                } catch (e) {
                    data = obj;
                }
                return data;
            }
        },
        /*移除本地缓存*/
        rData: function (key) {
            localStorage.removeItem(key)
        },
        /*记录用户浏览记录*/
        recordUserView: function (openId, type, viewId) {
            $.ajax({
                url: VIEWLOG_URL,
                data: {
                    openId: openId,
                    type: type,
                    viewId: viewId,
                    source: VIEWLOG_SOURCE
                },
                type: 'post',
                dataType: 'json',
                success: function (res) {
                },
                error: function () {
                }
            });
        }
    }
    address("#address");
}
function getUserData() {
    var user = $api.getStorage('user');
    if (typeof user == 'undefined') { // 登录
        openWin('../login_win');
    }
    var res = {};
    res.openId = user.openId;
    res.tel = user.tel;
    res.userName = user.nickName ? user.nickName : user.tel;
    res.token=yltcrypt.cpt(user.openId);
    return res;
}
function address(id) {
    var sign = new Vue({
        el: id,
        data: {
            deliverys: [],
            name: '',
            tel: '',
            procity: '',
            province: '',
            city: '',
            district: '',
            detaill: '',
            lng: '',
            lat: '',
            addreid: '',
            areaprovince: '请选择',
            areacity: '请选择',
            areaarea: '请选择',
            items: [],
            selecitys: [],
            seleareas: [],
            isActive: false,
            province: '',
            cityId: '',
            areaId: '',
            tit: '',
            addtype: '',
            userId: '',
            priority: ""
        },
        methods: {
            setDefault:function(addressId){
                var data = {openId: userData['openId'], aid: addressId};
                JW.ajax("/customer/setSelectAddress", data, function (res) {
                    if(res.code==0){
                        $(".aui-checkbox").prop("checked",false);
                        $("#"+addressId).prop("checked",true);
                        toast.success({
                          title:"设置成功"
                        })
                    }else{
                        $("#"+addressId).prop("checked",false);
                    }
                }, false)
            },
            /*定位获取详细地址*/
            getLocal:function (name,pageParam) {
                // api.openWin({
                //     name: name,
                //     url: name+'.html',
                //     bgColor: 'rgba(0,0,0,0)'
                //     //pageParam: pageParam
                // });
                window.location.href=name+".html";
            },
            //编辑与新增
            bjadd: function (name, tel, province, city, district, detaill, addreid, seleted,lng,lat) {
              console.log(lng);
              console.log(lat);
                if (arguments.length != 0) {
                    this.tel = tel;
                    this.name = name;
                    $("#city-picker").val(province+" "+city+" "+district)
                    this.detaill = detaill;
                    this.addreid = addreid;
                    this.tit = '修改收货地址';
                    this.addtype = 1;
                    //this.province = province;
                    //this.city = city;
                    //this.district = district;
                    this.lng = lng;
                    this.lat = lat;
                } else {
                    this.tel = '';
                    this.name = '';
                    this.detaill = '';
                    this.addreid = 0;
                    this.tit = '新建收货地址';
                    this.addtype = 0;
                    //this.province = '';
                    //this.city = '';
                    //this.district = '';
                    this.lng = 0;
                    this.lat = 0;

                  // api.openWin({
                  //   name: 'my_frm_addressDetail',
                  //   url: 'my_frm_addressDetail.html',
                  //   pageParam: {name: 'pageparamname'}
                  // });
                }
                if (seleted == 1) {
                    this.isActive = true
                } else {
                    this.isActive = false
                }
                $("#bjaddress").show();
                $(".addressblock").hide();

            },
            sectionarr: function () {
                $("#sectionress").show();
                $(".addressblock").hide()
            },
            //地区
            procitya: function () {
                var data = {prId: 0, level: 1};
                var _this = this;
                JW.ajax("/user/region", data, function (rea) {
                    _this.items = rea.data

                }, false)
                $("#chooseAddressPage").show();
                $(".check-page").hide()
            },
            switchul: function (procince, parantId, indexa) {
                this.areaprovince = procince;
                var _this = this;
                var data = {prId: parantId, level: 2};
                var winWidth = $(window).width();
                this.province = parantId;
                JW.ajax("/user/region", data, function (rea) {
                    _this.selecitys = rea.data

                }, false)
                $("#addressContentDiv").css({
                    "transform": "translate(-" + indexa * winWidth + "px,0px)",
                    "-webkit-transform": "translate(-" + indexa * winWidth + "px,0px)"
                });
                $("#headAddressUl li").eq(indexa).show().addClass("head-address-li").siblings().removeClass("head-address-li")
            },
            switchcity: function (procince, parantId, indexa) {
                this.areacity = procince;
                var _this = this;
                var data = {prId: parantId, level: 3};
                var winWidth = $(window).width();
                this.cityId = parantId;
                JW.ajax("/user/region", data, function (rea) {
                    _this.seleareas = rea.data
                    if (rea.data.length != 0) {
                        $("#addressContentDiv").css({
                            "transform": "translate(-" + indexa * winWidth + "px,0px)",
                            "-webkit-transform": "translate(-" + indexa * winWidth + "px,0px)"
                        })
                        $("#headAddressUl li").eq(indexa).show();
                        $("#headAddressUl li").eq(indexa).show().addClass("head-address-li").siblings().removeClass("head-address-li")
                    } else {
                        _this.procity = _this.areaprovince + _this.areacity;
                        $("#chooseAddressPage").hide();
                        $(".check-page").show()
                    }
                }, false)
            },
            switchprocity: function (procince, parantId) {
                this.areaarea = procince;
                this.areaId = parantId;
                this.procity = this.areaprovince + this.areacity + this.areaarea;
                $("#chooseAddressPage").hide();
                $(".check-page").show()
            },
            tranlateDiv: function (index) {
                var winWidth = $(window).width();
                $("#headAddressUl li").eq(index).addClass("head-address-li").siblings().removeClass("head-address-li");
                for (var i = 0; i < 3; i++) {
                    if (i > index) {
                        $("#headAddressUl li").eq(i).hide()
                    }
                }
                $("#addressContentDiv").css({
                    "transform": "translate(-" + index * winWidth + "px,0px)",
                    "-webkit-transform": "translate(-" + index * winWidth + "px,0px)"
                })
            },
            switchmr: function () {
                this.isActive = !this.isActive;

            },
            deletedd: function (addressId) {
                var self=this;
                var dialog=new auiDialog();
                dialog.alert({
                    msg:'确定删除吗？',
                    buttons:['取消','删除']
                },function(ret){
                    if(ret.buttonIndex==2){
                        var data = {openId:userData['openId'],aid: addressId, token:userData['token'] };
                        JW.cajax("/customer/delAddress", data, function (res) {
                            if(res.code==0){
                                self.addAjax()
                            }else{
                              toast.loading({
                                title:res.msg,
                                duration:1000,
                                location:'middle'
                            },function(ret){
                                console.log(ret);
                                setTimeout(function(){
                                    toast.hide();
                                }, 1000)
                              })
                            }
                        });

                    }
                })

            },
            //保存收货地址
            preser: function () {
                var self=this;
                var mr;

                if (this.isActive == true) {
                  
                    mr = 0
                } else {
                    mr = 1
                }
                var i=$("#city-picker").val().split(" ");
                this.province=i[0];
                this.city=i[1];
                this.district=i[2];
                var mPattern = /^(1)\d{10}$/;
                if (mPattern.test(this.tel) && this.name != "" && this.province != "" && this.detaill != "") {
                    var data = {
                        openId:userData['openId'],
                        aid:0,
                        uname: this.name,
                        tel: this.tel,
                        province: this.province,
                        city: this.city,
                        district: this.district,
                        detail: this.detaill,
                        select: mr,
                        token: userData['token']
                    };
                    if (this.addtype == 1) {
                        data.aid = this.addreid;
                    }
                    JW.cajax("/customer/setAddress", data, function (res) {
                      // console.log(JSON.stringify(res));
                        if(res.code==0){
                            self.addAjax()
                        }
                    });
                } else {
                    toastSuccess("请输入完整收货地址", 2000);
                }
            },
            addAjax: function () {
                location.reload();
                // api.sendEvent({
                //     name: 'reloadAddressList'
                // });
            },
            hidebj: function () {
                $("#bjaddress").hide();
                $(".addressblock").show()
            },
            backToOrder: function (uname, tel, province, city, district,address,detail,aid,lng,lat) {
                if (rback == 1) {
                    // api.sendEvent({
                    //     name: 'select_address',
                    //     extra: {
                    //         id: aid,
                    //         name: uname,
                    //         tel: tel,
                    //         address: province+city+district+address+detail,
                    //         city: city,
                    //         lng: lng,
                    //         lat: lat
                    //     }
                    // });
                    // api.closeWin();
                    window.close();
                }
            }
        },
        watch: {
            'items': function (newval, oldval) {

            }
        },
        mounted: function () {
            var data = {openId: userData['openId']};
            var _this = this;
            JW.cajax("/customer/myAddress", data, function (res) {
                if (res.code == 0) {
                    _this.deliverys = res.data
                } else {
                    toastSuccess(res.msg);
                }
            });
            // api.addEventListener({name:'select_location'},function(ret,err){
            //     if(ret){
            //         _this.detaill=ret.value.location;
            //         //$('#address_where').val(ret.value.location).attr('disabled',false).focus();
            //     }
            // });
            // api.addEventListener({name:'userLocationSearchEvent'},function(ret,err){
            //     if(ret){
            //         _this.procity = ret.value.province+ret.value.city+ret.value.district+ret.value.address;
            //         _this.province = ret.value.province;
            //         _this.city = ret.value.city;
            //         _this.district = ret.value.district;
            //         _this.address = ret.value.address;
            //         _this.lng = ret.value.lon;
            //         _this.lat = ret.value.lat;
            //     }
            // });
            setTimeout(function(){
                $("#city-picker").cityPicker({
                    toolbarTemplate: '<header class="bar bar-nav">' +
                    '<button class="button button-link pull-right close-picker color-palered aui-text-right">完成</button>' +
                    '<h1 class="title"></h1>' +
                    '</header>'});
            },80)
        }

    });

}
//成功提示框
function toastSuccess(msg, time) {
  var toast = new auiToast();
  toast.loading({
    title:msg,
    duration:time,
    location:'middle'
},function(ret){
    console.log(ret);
    setTimeout(function(){
        toast.hide();
    }, 1000)
  })
    // api.toast({
    //     msg: msg,
    //     duration: time,
    //     location:'middle'
    // });
}
function lingSubmit() {
    $(".s_submitexa").addClass("s_submitok");
}
