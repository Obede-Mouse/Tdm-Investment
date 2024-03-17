var prod_img_compare_color="//i.mt.lv/img/rb/compare_color.png",
	prod_img_compare="//i.mt.lv/img/rb/compare.png",
	prod_img_remove="//i.mt.lv/img/rb/remove_compare.png",
	prod_img_loader="//i.mt.lv/img/mt/v2/ajax-load-bars.gif",
	movieobj,bobj;
function loadmovie(){
	start = parseInt( movieobj.data('start') );
	end = parseInt( movieobj.data('end') );
	url = movieobj.data('url');
	type = movieobj.data('type');
	arr = [];
	for (var x=start; x<=end; x++) arr.push(url+''+x+''+type);
	$('#imagelightbox').threesixty({images:arr,method:'mousemove','cycle':3,direction:"forward"});
}

function comp_add(data){
	if(typeof data.data != "undefined" && data.done) {
		bobj.find('.compare_image').addClass('tocompare').removeClass('not_selected').attr('src',prod_img_compare_color);
		addToCompare(data.data);
		countCompare();
	} else {
		bobj.addClass('addcompare').addClass('removecompare');
	}
}

function comp_rem(data){
	if(typeof data.done != "undefined" && data.done){
		bobj.find('.compare_image').removeClass('tocompare').addClass('not_selected').attr('src',prod_img_compare);
		$('#compare'+bobj.data('p')).remove();
		countCompare();
	} else {
		bobj.addClass('removecompare').removeClass('addcompare');
	}
}
function comp_remt(data){
	if (typeof data.done!="undefined" && data.done){
		id="#compare"+bobj.data('p');
		$(id).remove();
		$(id).removeClass('removecompare').addClass('addcompare');
		$(id).find('.compare_image').removeClass('tocompare').addClass('not_selected').attr('src',prod_img_compare);
		countCompare();
	}
}

function comp_send(inparams, insuccess){
	$.ajax({
		type: 'post',
		url: "/products/",
		data: inparams,
		success: insuccess
	});
}

function addToCompare(data) {
	var html = ''
		+'<div id="compare'+data.id+'" class="small-4 columns compares compareobj end">'
		+'<a href="#!"><img src="'+data.image+'" title="'+data.name+'" alt="'+data.name+'"></a>'
		+'<a href="#!" data-p="'+data.id+'" class="remove-compare"><img src="'+prod_img_remove+'" alt="Remove" title="Remove"/></a>'
		+'</div>';
	$('#comparelist').append(html);
}

function checkFoundation(){
	if(typeof $(document).foundation == "function"){
		$(document).foundation();
	} else {
		window.setTimeout(function(){checkFoundation();},5);
	}
}

function countCompare() {
	var b = $('.compares');
	//console.log(b.length);
	if(b.length >= 3 ) {
		$('.not_selected').hide();
	} else {
		$('.not_selected').show();
	}
	if(b.length > 0) {
		$('.compareobj').css('display','block');
	} else {
		$('.compareobj').hide();
	}
}

$(document).ready(function() {
	checkFoundation();
	countCompare();

	$(document).on('click', '.loadmovie', function () {
		movieobj = $(this);
		movieobj.attr("href", prod_img_loader);
		window.setTimeout(loadmovie, 1100);
	});

	$(document).on('change', '.navigation', function () {

		var sel = $(this);
		var curl = window.location.href;
		var arr = curl.split("/");
		var fullurl = arr[0]+'//'+arr[2]+'/products/group/';

		url = sel.find(':selected').val();
		if(url.length > 3) {
			var navigate = fullurl+url;
			window.location.href = navigate;
		}
	});

	$(document).on('click', '.addcompare', function () {
		var all = $('.compares');
		bobj = $(this);
		bobj.removeClass('addcompare').addClass('removecompare');
		if(all.length < 3 && bobj.data('p') > 0 ) {
			comp_send( {ax:'addtocompare',addtocompare:bobj.data('p')}, comp_add );
		} else {
			bobj.addClass('addcompare').addClass('removecompare');
		}
	});

	$(document).on('click', '.removecompare', function () {
		bobj = $(this);
		bobj.removeClass('removecompare').addClass('addcompare');
		if(bobj.data('p') > 0) {
			comp_send( {ax:'removecompare',removecompare:bobj.data('p')}, comp_rem );
		} else {
			bobj.addClass('removecompare').removeClass('addcompare');
		}
	});

	$(document).on('click', '.remove-compare', function () {
		bobj = $(this);
		if(bobj.data('p') > 0) {
			comp_send( {ax:'removecompare',removecompare:bobj.data('p')}, comp_remt );
		}
	});

	$(document).on('click', '.closef', function () {
		var c = $(this);
		c.removeClass('closef').addClass('showf').html('<i class="fa fa-eye" aria-hidden="true"></i> Show');
		$('#filterblock').hide();
		stick();
	});

	$(document).on('click', '.showf', function () {
		var c = $(this);
		c.removeClass('showf').addClass('closef').html('<i class="fa fa-eye-slash" aria-hidden="true"></i> Hide');
		$('#filterblock').show();
		stick();
	});

});
