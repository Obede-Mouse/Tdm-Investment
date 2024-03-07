function consultants_reveal(){
	$("#consultant_list_spinner").hide();
	$("#consultant_list_element").show();
}

$(document).ready(function(){
	console.log('[' +Date.now()+ '] consultantlisting started');
	let clname=".consultantlisting";
	$(clname+' li ul').hide();
	$(clname+' li span').click(function() {
		theList = $(this).parent().find('ul');
		$(theList).slideToggle('fast');
		$(this).text(($(this).text()==' [+]')?' [-]':' [+]');
	}).css('cursor','pointer');
	$(clname+" li b").click(function() {
		let continentId = $(this).attr('id');
		$(".cards > div:not(."+continentId+")").hide();
		if (!$(".cards > div."+continentId).is(":visible") ){
			$(".cards > div."+continentId).fadeIn('fast');
		}
		$('.cards > div.' + continentId + ' div').fadeIn('fast');
		window.history.pushState({},"", '/consultants/'+continentId.substring(3));
		//window.location.href = ;
	}).css('cursor','pointer');
	$(".all").click(function() {
		$('.cards > div:hidden').fadeIn('fast');
		$('.cards > div > div:hidden').fadeIn('fast');
		window.history.pushState({},"", '/consultants');
		window.location.href = '/consultants';
	});
	$(clname+" li ul li").click(function() {
		let continentId = $(this).parent().parent().find('b').attr('id');
		let countryId = $(this).attr('id');
		$(".cards > div:not(."+continentId+")").hide();
		if (!$(".cards > div."+continentId).is(":visible") ){
			$(".cards > div."+continentId).fadeIn('fast');
		}
		$(".cards > div."+continentId+' > div:not(.'+countryId+')').fadeOut('fast');
		$(".cards > div."+continentId+' > div.'+countryId).fadeIn('fast');
		window.history.pushState({},"", '/consultants/'+continentId.substring(3)+'/'+countryId.substring(1));
	}).css('cursor','pointer');
	console.log('[' +Date.now()+ '] consultantlisting ended');

	if ($("#activecontinent").length>0){
		$("#activecontinent").click();
	} else if( $("#activecountry").length>0 ){
		$("#activecountry").click();
	}

	console.log('[' +Date.now()+ '] consultant url started');
	var con_url = window.location.href;
	var con_url_parts = con_url.replace(/\/\s*$/, '').split('/');
	con_url_parts.shift();

	if (typeof con_url_parts[2] != "undefined" && con_url_parts[2] == 'consultants' && typeof con_url_parts[3] != 'undefined') {
		if (typeof con_url_parts[4] == "undefined") {
			var con_func = function(){ $("#con" + con_url_parts[3]).click(); consultants_reveal(); };
		} else {
			var con_func = function(){
				$("#con" + con_url_parts[3]).parent().find("span").click();
				$("#c" + con_url_parts[4]).click();
				consultants_reveal();
			};
		}
		setTimeout(con_func, 10);
	} else {
		consultants_reveal();
	}
	console.log('[' +Date.now()+ '] consultant url ended');

});
