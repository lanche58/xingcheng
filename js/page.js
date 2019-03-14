var isTouch = Modernizr.touch,
	isMobile = false,//区分移动端与PC端
	mobile = false,//区分手机端与平板
	w_width = 0,
	w_height = 0,
	$mtoph = 0,
	ST = 0,
	navItem = 0,
	$menuBtn = $('.menu-handler'),
	$menuBox = $(".menuBox");

//移动端事件和PC事件的切换	
var _mousemove;
var _click;
var _mousedown;
var _mouseup;
if (Modernizr.touch) {
    _mousemove = "touchmove";
    _click = "touchend";
    _mousedown = "touchstart";
    _mouseup = "touchend";
} else {
    _mousemove = "mousemove";
    _click = "click";
    _mousedown = "mousedown";
    _mouseup = "mouseup";
};

function pageBox() {
    w_width = $(window).width();
    w_height = $(window).height();
    $mtoph = $('.mtop').height();

    if (w_width <= 1024) {
        isMobile = true;
    } else if (w_width > 1024) {
        isMobile = false;
    };
    if (w_width <= 640) {
        mobile = true;
    } else if (w_width > 640) {
        mobile = false;
    };
};
pageBox();
$(window).resize(function () {
    pageBox();
});
$(function () {
    $('.ad-btn').bind(_click, function() {
        $(this).addClass('active');
        $('.ad-wrap').addClass('show');
    });
    $('.ad-wrap .close').bind(_click, function() {
        $('.ad-btn').removeClass('active');
        $(this).parents().removeClass('show');
    });



    var isopen = 0;
    $('.flinkmore .t').click(function () {
        if (isopen == 0) {
            isopen = 1;
            $(this).addClass('act');
            $('.flinkmore ul').stop().slideDown(300);
        } else {
            isopen = 0;
            $(this).removeClass('act');
            $('.flinkmore ul').stop().slideUp(300);
        }
    });
    $('.flinkmore').mouseleave(function () {
        isopen = 0;
        $(this).removeClass('act');
        $('.flinkmore ul').stop().slideUp(300);
    });
    /*mobile nav*/
    $menuBtn.bind(_click, function () {
        if (navItem == 0) {
            jQuery(this).addClass("active");
            $menuBox.show().stop(false, false).animate({ top: 0 });
            navItem = 1;
        } else {
            $(this).removeClass("active");
            $menuBox.stop(false, false).animate({ top: -100 + "%" }, function () {
                $(this).hide();
            });
            navItem = 0;
        };
    });
    $('.navMobile dd p a').bind(_click, function (e) {
        if ($(this).parent().next('.mtnav').length >= 1) {
            if(!$(this).hasClass('act')){
                e.preventDefault();
                $('.navMobile dd p a').removeClass('act');
                $('.mtnav').stop().slideUp(300);
                $(this).addClass('act');
                $(this).parent().next('.mtnav').stop().slideDown(300);
            }else{
                $(this).removeClass('act');
                $(this).parent().next('.mtnav').stop().slideUp(300);
            }
        }
    });

    /* page banner */
    setTimeout(function () {
        $('.pbtxts .transY').addClass('transShow');
        $('.pbtxts .transX').addClass('transShow');
        $('.pbtxts .transX2').addClass('transShow');
    }, 100);
    $(window).scroll(function () {
        var windowTop = $(window).scrollTop();
        if (windowTop < w_height && !isMobile) {
            $('.pbanner img').css('transform', "translate(0px," + (windowTop) / 1.5 + "px)");
        };
    });
    /* page banner end */

    function getHash() {
        var hash = location.href.split("#")[1];
        if (hash) {
            setTimeout(function () { $("html,body").animate({ scrollTop: $("#" + hash).offset().top - $mtoph }, 20); }, 100);
        }
    };
    getHash();
    $('.pnav li').click(function () {
        var phash = $(this).find('a').attr('href').split("#")[1];
        if (phash) {
            setTimeout(function () { $("html,body").animate({ scrollTop: $("#" + phash).offset().top - $mtoph }, 800, 'easeInOutExpo'); }, 250);
        }
    });
    $('.mtnav a').click(function () {
        var mhash = $(this).attr('href').split("#")[1];
        if (mhash) {
            $menuBtn.removeClass("active");
            $menuBox.stop(false, false).animate({ top: -100 + "%" }, function () {
                $(this).hide();
            });
            navItem = 0;
            setTimeout(function () { $("html,body").animate({ scrollTop: $("#" + mhash).offset().top - $mtoph }, 800, 'easeInOutExpo'); }, 250);
        }
    });
    $('.flink a').click(function () {
        var fhash = $(this).attr('href').split("#")[1];
        if (fhash) {
            setTimeout(function () { $("html,body").animate({ scrollTop: $("#" + fhash).offset().top - $mtoph }, 800, 'easeInOutExpo'); }, 250);
        }
    });
    //back top -- 回到顶部
    $('#top').click(function () {
        $('html,body').stop().animate({ scrollTop: 0 }, 500, "easeInOutExpo");
    });

    //weixin
    setPopUp($('.weixin'), "官方微信");
    function setPopUp(obj, title) {
        obj.click(function () {
            var str = '<div class="popUpblack"><div class="popUp"><div class="t">' + title + '<span class="close">关闭</span></div><div class="img"><img src="' + obj.attr("href") + '"/></div></div></div>';
            $("body").append(str);
            jQuery(".popUpblack").fadeIn();
            jQuery(".popUp").animate({ marginTop: "-127" }, 400);
            $(".popUp .close").click(function () {
                $(".popUpblack").remove();
            });
            jQuery(".popUpblack").click(function () { $(".popUpblack").remove(); });
            return false;
        });
    };
});
var objplay;
var Video = {
    load: function (objs) {
        objplay = jwplayer(objs.vcontainer).setup({
            flashplayer: 'js/video/flashplay.swf',
            html5player: 'js/video/html5player.js',
            file: objs.vfiles,
            image: objs.vfimg,
            width: '100%',
            height: '100%',
            aspectratio: '16:9',
            stretching: 'fill',
            controls: 'true',
            autostart: objs.isautoplay
        });
        return objplay;
    }
};
function setImgMax(img, imgW, imgH, tW, tH) {
    var tWidth = tW || w_width;
    var tHeight = tH || w_height;
    var coe = imgH / imgW;
    var coe2 = tHeight / tWidth;
    if (coe < coe2) {
        var imgWidth = tHeight / coe;
        img.css({ height: tHeight, width: imgWidth, left: -(imgWidth - tWidth) / 2, top: 0 });
    } else {
        var imgHeight = tWidth * coe;
        img.css({ height: imgHeight, width: tWidth, left: 0, top: -(imgHeight - tHeight) / 2 });
    };
};

$(".search-tx").keyup(function (event) {
    var keyvalue = event.which;
    var KeyWord = $(this).val();
    if (keyvalue == 13) {
        if (KeyWord == '') {
            $(this).focus();
            alert("查询内容不能为空！");
            return;
        }
        else {
            window.location = "search.aspx?KeyWord=" + KeyWord;
        }
    }
})
$(".search-btn").click(function () {
    var KeyWord = $(".search-tx").val();
    if (KeyWord == "") {
        $(".search-tx").focus();
        alert("查询内容不能为空！");
        return;
    }
    else {
        window.location = "search.aspx?KeyWord=" + KeyWord;
    }
});