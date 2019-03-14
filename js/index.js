$(function(){

	function initBox() {
		if(!isMobile){
            $('.banner').css('height', w_height - $mtoph);
            $('.banner .slides').css('height', w_height - $mtoph);
            $('.banner .slides li').css('height', w_height - $mtoph);
            setImgMax($('.banner .bimg'), 1800, 877, w_width, w_height - $mtoph);
		}else{
			$('.banner').css('height', 'auto');
           	$('.banner .slides').css('height', 'auto');
           	$('.banner .slides li').css('height', 'auto');
		   	$('.banner .bimg').attr("style", "");
		}
    };
    initBox();
    $(window).resize(function () {
        initBox();
    });
	
	var bannersider=jQuery(".banner"); 
	bannersider.flexslider({
		animation: "fade",
		easing:"swing",
		slideshowSpeed: 4000,
		animationSpeed: 0,
		slideshow:true,
		animationLoop:true,
		pauseOnHover:false,
		directionNav:false,
		controlNav:true,
		start: function(slider) {		
		  jQuery(".banne-list li").removeClass("on").eq(slider.currentSlide).addClass("on");
		  jQuery(".bamnline").addClass("load");
		  jQuery('.banner .slides li').eq(slider.currentSlide).addClass("imgIn").siblings().removeClass("imgIn");
		},
		after: function(slider) {
			jQuery(".bamnline").addClass("load");
			jQuery(".banne-list li").removeClass("on").eq(slider.currentSlide).addClass("on");
			jQuery('.banner .slides li').eq(slider.currentSlide).addClass("imgIn").siblings().removeClass("imgIn");
		},
		before: function(slider) {
			jQuery(".bamnline").removeClass("load");
		}
	});
	jQuery('.video-info a.items').click(function () {
		Video.load({
			vcontainer: 'videobox',
			vfimg: jQuery(this).attr("data-video-image"),
			vfiles: jQuery(this).attr("data-video-url"),
			isautoplay: 'true'
		});
		jQuery(".vwrap").fadeIn();
	});
	jQuery(".vwrap .close,.vwrap .videobtg").click(function () {
		objplay.stop(); 
		jQuery(".vwrap").hide();
		$('#videobox').html("");
	});
	
	$('.isnpics').slick({
		dots: true,
		arrows: false,
		autoplay: true,
        autoplaySpeed: 5000,
		speed: 1000
	});
	
	var step = 0;
	function changeNews(){
		$('.in-nav li').removeClass('act').eq(step).addClass('act');
		$('.in-list li').hide().removeClass('show').eq(step).show();
		setTimeout(function(){
			$('.in-list li').eq(step).addClass('show');
		},100);
	};
	changeNews();
	$('.in-nav li').click(function(){
		step = $(this).index();
		changeNews();
	});
	$('.ixItem').slick({
		autoplay: true,	
	    arrows: true,
	    dots: true,
	    infinite: true,
	    easing:"easeInOutExpo",
	    pauseOnHover: false,
	    fade: true,
		autoplaySpeed: 5000,
		responsive: [
		  {
			  breakpoint: 862,
			  settings: {
				fade: false,
				speed: 500
			  }
		  }
		]
	});
	$('.im-list').slick({
		vertical: true,
		dots: false,
		arrows: true,
		autoplay: false,
		speed: 1000
	});
	
	function ismvslick(){
		$('.mvmore').slick({
			slidesToShow: 4,
			slidesToScroll: 1,
			dots: false,
			arrows: true,
			autoplay: false,
			speed: 1000
		});
	};
	if(!isMobile){
		$('.ixVideo a.items').click(function (e) {
			e.preventDefault(); 
			Video.load({
				vcontainer: 'mvi',
				vfimg: jQuery(this).attr("data-video-image"),
				vfiles: jQuery(this).attr("data-video-url"),
				isautoplay: 'true'
			});
			$(".mvbox").fadeIn();
			ismvslick();
		});
		$(".mvclose").click(function () {
			 objplay.stop();
			$(".mvbox").hide();
			$('#mvi').html("");
			$('.mvmore').slick('unslick');
			$('.mvmore a.items').removeClass('act');
		});
		$(document).on('click','.mvbox',function(e){
			if ($(e.target).hasClass('mvbox')) {
				objplay.stop();
				$(".mvbox").hide();
				$('#mvi').html("");
				$('.mvmore').slick('unslick');
				$('.mvmore a.items').removeClass('act');
			}
		});
		$('.mvmore a.items').click(function() {
			if(!$(this).hasClass('act')){
				$('.mvmore a.items').removeClass('act');
				$(this).addClass('act');
				Video.load({
					vcontainer: 'mvi',
					vfimg: jQuery(this).attr("data-video-image"),
					vfiles: jQuery(this).attr("data-video-url"),
					isautoplay: 'true'
				});
			}else{
				return;
			}
		});
	}
	/*function ixproBox(){
		var processC=$('.ixproslide').hasClass('slick-slider');
		if(w_width<=861&&processC==false){
			$('.ixproslide').slick({
				arrows: false,
				dots: true,
				customPaging: function(slider, i){
					return $('<a data-role="none" role="button" tabindex="0"></a>').html('<i class="bg"></i>'+'<p class="txx">'+$('.ixproslide .item').eq(i+1).attr('data-title')+'</p>');
				}
			});
		}else if(w_width>861&&processC==true){
			$('.ixproslide').slick('unslick');
		}else{
			return;
		}
	};
	ixproBox();
	$(window).resize(function () {
        initBox();
		ixproBox();
    });*/
	/*var banenrLen=$bannerSlide.find('.item').length;
	$('.banner .anum').html(banenrLen);
	$bannerSlide.on('beforeChange', function(event, slick, currentSlide, nextSlide){
		$('.banner .cnum').html(nextSlide+1);
	});*/
	/*$('.probox1 .ip-prev').click(function(e){
		e.preventDefault();
		$('.probox1 .proslide').slick('slickPrev');
	});
	$('.probox1 .ip-next').click(function(e){
		e.preventDefault();
		$('.probox1 .proslide').slick('slickNext');
	});
	$('.probox1 .proslide').slick({
		dots: false,
		fade: true,
		responsive: [
			{
				breakpoint: 861,
				settings: {
					fade: false,
					dots: true,
					arrows: false,
				}
			}
		]
	});*/
	/* $(".i3 .works a").each(function(i,o){
		$(this).css({"transition":"700ms "+(i*200+300)+"ms"});
	});  */
	//滚动动画
	function scrollMove(){
		ST = $(window).scrollTop();
		if( ST > $('.ix1').offset().top - w_height*0.7 ){
			$('.ix1 .transY').addClass('transShow');
		}
		if( ST > $('.ix2').offset().top - w_height*0.7 ){
			$('.ix2 .transY').addClass('transShow');
		}
		if( ST > $('.ix3').offset().top - w_height*0.7 ){
			$('.ix3 .transY').addClass('transShow');
		}
	};
	//scrollMove();
	$(window).scroll(function(){
		scrollMove();
	}); 
	
})