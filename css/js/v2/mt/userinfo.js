var map = null,
	marker = null,
	allowedBounds = null,
	country_list = null,
	cities_name = null,
	vat_picker = null,
	address_input = null,
	a_input = null;

function openMap() {
	if(!window.training_lat || !window.training_lon) {
		var coord = $('#my-location-here').val().split(',');
		if(coord[0])
			window.training_lat = coord[0];
		if(coord[1])
			window.training_lon = coord[1];
	}
	var mapOptions = {
		center: new google.maps.LatLng(window.training_lat || 0, window.training_lon || 0),
		zoom: (window.training_lat ? 14 : 2), // if is set then zoom in
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		overviewMapControl: false,
		streetViewControl: false,
		gestureHandling: 'greedy',
		scrollwheel: true
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	marker = new google.maps.Marker({
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		position: map.getCenter()
	});
	google.maps.event.addListenerOnce(map,'idle',function() {
		allowedBounds = map.getBounds();
	});
	map.setOptions({
		center_changed: function () {
			checkBounds();
			marker.setPosition(map.getCenter());
			getLocation();
		}
	});
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			try {
				var latLong = [position.coords.latitude, position.coords.longitude];
				map.setCenter(latLong);
			} catch (e) {
			}
		});
	}
}

function checkBounds() {
	if(! allowedBounds.contains(map.getCenter())){
		var C = map.getCenter();
		var X = C.lng();
		var Y = C.lat();
		var AmaxX = allowedBounds.getNorthEast().lng() + 45;
		var AmaxY = allowedBounds.getNorthEast().lat() + 20;
		var AminX = allowedBounds.getSouthWest().lng() - 45;
		var AminY = allowedBounds.getSouthWest().lat() - 10;
		if (X < AminX) {X = AminX;}
		if (X > AmaxX) {X = AmaxX;}
		if (Y < AminY) {Y = AminY;}
		if (Y > AmaxY) {Y = AmaxY;}
		map.panTo(new google.maps.LatLng(Y,X));
	}
}

function saveLocation() {
	var center = map.getCenter();
	center = new google.maps.LatLng(center.lat(), center.lng(), false);
	var cord = center.toUrlValue();
	$('#my_location_input').val(cord);
	$('#my-location-here').val(cord);
}

function getLocation() {
	var center = map.getCenter();
	center = new google.maps.LatLng(center.lat(), center.lng(), false);
	var cord = center.toUrlValue();
	var res = cord.split(',');
	var lat = window.training_lat = res[0];
	var lon = window.training_lon = res[1];
	$('.latitude').attr('value', lat);
	$('.longitude').attr('value', lon);
}

function geocodeAddress() {
	var geocoder = new google.maps.Geocoder();
	var address = document.getElementById('map-address').value;
	geocoder.geocode({'address': address}, function (results, status) {
		if (status === 'OK') {
			map.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location);
			map.setZoom(10);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function closeRegisterMap() {
	saveLocation();
	$("#map").html('');
	$('#choose_from_map').foundation('reveal', 'close');
}

function initMap() { // google map will call this function
		if(typeof $(document).foundation === "function"){
			$(document).foundation('reveal', 'reflow');
			$(document).on("opened.fndtn.reveal", "[data-reveal]", function() {
				$("a.close-reveal-modal").click(function () {
					closeRegisterMap();
				});
				$("a.ctm-close").click(function () {
					closeRegisterMap();
				});
				openMap();
				document.getElementById('map-search').addEventListener('click', function () {
					geocodeAddress();
				});
				document.getElementById('map-address').addEventListener('keyup', function (e) {
					if (e.keyCode === 13) {
						geocodeAddress();
					}
				});
			});
		} else {
			window.setTimeout(function () {
				initMap();
			}, 10);
		}
}
function checkVat() {
	var $$ = $(this);
	var error = $('.error_label');
	if ($$.val().length > 0) {
		$.ajax({
			type: "POST",
			url: '/client/vatPrepare.php',
			data: {
				v: $$.val(),
				c: country_list.val(),
				a: a_input.val()
			},
			success: function (data) {
				if(data.e) {
					var icon = '<i class="fa fa-warning"></i> ';
					error.html(icon + data.e);
					$$.addClass('error_input');
				} else {
					if(data.c === true && data.v) {
						$$.val(data.v);
					}
					error.html('');
					$$.removeClass('error_input');
				}
			}
		});
	} else {
		error.html('');
		$$.removeClass('error_input');
	}
}
function scrollToElem(hash) {
	$this = $(hash);
	var pos = 200;
	if ($('.smally').is(":visible")) {
		pos = 146;
	}
	if (typeof hash !== null) {
		if ($this.length !== 0) {
			$this.addClass('active').parent().addClass('active').find('a').attr('aria-expanded', 'true');
			$('html, body').animate({
				scrollTop: $this.offset().top - pos
			}, 500);
		}
	}
}

function userinfo_accesskey_generate(){
	if (typeof uinfo_accesskey_gen!='number' || uinfo_accesskey_gen!=1) return;
	var xcont = { 'cmd': uinfo_accesskey_gen_cmd, 'lengthopt': $('#'+uinfo_accesskey_gen_keylen).val() };
	$.ajax({ 'type': 'post', 'data': xcont, 'url': '/client/userinfo' })
	.success(function(data){
		if (typeof data.error!='undefined'){
			$('#'+uinfo_accesskey_fnote).html('Failed to generate: '+data.error+', please try again!');
		} else if(typeof data.access_key != 'undefined' && typeof data.valid!='undefined'){
			$('#'+uinfo_accesskey_fnote).html('Generated new account authorization key');
			$('#'+uinfo_accesskey_fbody).html('<code style="padding:10px;">'+data.access_key+'</code><p>Expires in: '+data.valid+'</p>');
		}
	});
}

function userinfo_accesskey_extend(){
	if (typeof uinfo_accesskey_ext!='number' || uinfo_accesskey_ext!=1) return;
	var xcont = { 'cmd': uinfo_accesskey_gen_cmd, 'extend':true };
	$.ajax({ 'type': 'post', 'data': xcont, 'url': '/client/userinfo' })
	.success(function(data){
		if (typeof data.error!='undefined'){
			$('#'+uinfo_accesskey_fnote).html('Failed to extend: '+data.error+', please try again later!');
		} else if(typeof data.access_key != 'undefined' && typeof data.valid!='undefined'){
			$('#'+uinfo_accesskey_fnote).html('<span style="color:red">Extended account authorization key validation time!</span><br/>Expires in: '+data.valid);
		}
	});
}

function userinfo_changeCountry() {
	vat_picker.val('').trigger('change');
	cities_name.val('').trigger('change');
}

function userinfo_changeAddress(){
	let address = $(this).val();
	if (address){
		let txt = 'Search for exact address, e.g., ' + address;
		$('#map-address').attr('placeholder',txt).attr('title',txt);
	}
}

$(document).ready(function () {

	$(window).on('load', function () {
		var url = window.location.href;
		if (window.location.hash) { var hashz = url.substring(url.indexOf("#")); }
		if (typeof hashz!='undefined') scrollToElem(hashz);
	});

	country_list = $("select[name='user_country']");
	cities_name = $("input[name='user_city']");
	vat_picker = $("input[name='user_vat']");
	address_input = $('input[name="user_address"]');
	a_input = $('input[name="assistant"]');

	country_list.select2({
		width: '100%',
		sorter: function (results) {
			var query = $('.select2-search__field').val().toLowerCase();
			if (query.length > 0) {
				return results.sort(function (a, b) {
					return a.text.toLowerCase().indexOf(query) -
						b.text.toLowerCase().indexOf(query);
				});
			} else {
				return results;
			}
		}
	});

	country_list.change(userinfo_changeCountry);
	country_list.on("select2:selecting", userinfo_changeCountry);

	address_input.change(userinfo_changeAddress);

	// Check VAT number
	vat_picker.ready(checkVat);
	vat_picker.change(checkVat);
	vat_picker.blur(checkVat);

	// cards
	$('.account_card_config').each(function(idx,obj){
		$(obj).on('click',function(){
			let cfgval = $(this).data('cardcfg');
			$('.card_cfg_buttons').each(function(idx,obj){
				if ($(obj).attr('id')==cfgval) return;
				if ($(obj).is(':visible')) $(obj).hide(400);
			});
			if( $('#'+cfgval).is(':visible') ) {
				$('#'+cfgval).hide(400);
			} else {
				$('#'+cfgval).show(400);
			}
		});
	});

	$('.card_ajax_activity').each(function(idx,obj){
		$(obj).on('click',function(){
			$(obj).prop('disabled',true);
			if (typeof $(obj).attr('id')=='undefined'){
				$(obj).attr('id',Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5));
			}
			let send_data = {
				'cmd':$(obj).data('action'),
				'enable_id':$(obj).attr('id'),
			};
			if (typeof $(obj).data('input')!='undefined'){
				send_data['input'] = $('#'+$(obj).data('input')).val();
			}
			if (typeof $(obj).data('cardid')!='undefined'){
				send_data['cardid'] = $(obj).data('cardid');
			}
			$.ajax({
				'method':'post',
				'url':'/client/userinfo',
				'data':send_data,
				'success':function(data){
					if (typeof data.is_redirect=='boolean' && typeof data.redirect=='string'){
						if (window.location.href == data.redirect){
							window.location.reload();
						} else {
							setTimeout(function(){document.location.href = data.redirect;},250);
							//window.location.assign(data.redirect);
							//setTimeout(function(){window.location.reload();},5000);
						}
					} else if(typeof data.is_error=='boolean' && data.is_error && typeof data.message == 'string'){
						createInternalModal({
							'click_bg':true,
							'make_close':true,
							'content':'<p style="color:red;font-weight:bold;">'+data.message+'</p>'
						});
					}
					if (typeof data.enable_id=='string'){
						$('#'+data.enable_id).prop('disabled',false);
					}
				}
			});
		});
	});
});
