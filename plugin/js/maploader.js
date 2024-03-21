var la = false, lb = false, lc = false, ld = false;
if (typeof markers === "undefined") var markers = {};
if (typeof cluster === "undefined") var cluster = true;
if (typeof omstool === "undefined" || cluster == true) var omstool = false;

function asyncLoad(file, type) {
	d = document;
	h = d.getElementsByTagName('head')[0];
	if (type == 'link') {
		s = d.createElement('link');
		s.rel = "stylesheet";
		s.href = "https://i.mt.lv/css/" + file + ".css";
	} else {
		s = d.createElement('script');
		s.type = 'text/javascript';
		s.async = true;
		s.defer = true;
		s.src = 'https://i.mt.lv/js/' + file + '.js';
	}
	h.appendChild(s);
}

function startCounting() {
	if (la == true && typeof L == 'object') {
		if (cluster == false) {
			lb = true;
		} else if (cluster == true) {
			if (lb == false) {
				asyncLoad('leaflet/markercluster.1.3.0.min','link');
				asyncLoad('leaflet/markercluster.1.3.0.min');
				lb = true;
			}
		}
		if (lc == false) {
			asyncLoad('leaflet.fullscreen');
			lc = true;
		}
		if (omstool == false) {
			ld = true;
		} else if (omstool == true) {
			if (ld == false) {
				asyncLoad('leaflet.oms.min');
				ld = true;
			}
		}
	}
	if (la == false) {
		asyncLoad('leaflet/1.4.0.min', 'link');
//		asyncLoad('leaflet.fullscreen', 'link');
		asyncLoad('leaflet/1.4.0.min');
		la = true;
	}
	window.setTimeout(function(){ checkLoading(); },5);
}

function checkLoading() {
	if (la && lb && lc && ld) {
		if (cluster){
			if (
				typeof L.Control.FullScreen == "function"
				&& typeof L.MarkerClusterGroup == "function"
			){
				return initMap();
			}
		} else if (omstool) {
			if (typeof OverlappingMarkerSpiderfier == "function") {
				initMap();
				return;
			}
		} else {
			initMap();
			return;
		}
	}
	startCounting();
}

function checkHeight(min, max) {
	if (min && max) {
		if ($(window).scrollTop() > max) {
			$(window).scrollTop(min);
		}
	}
}

function getObjectKeyIndex(obj, keyToFind) {
	var i = 1, key;
	for (key in obj) {
		if (key == keyToFind) {
			return i;
		}
		i++;
	}
	return 0;
}

window.setLMapLocation = function() {
	if (!window.Lmap) return;
	//console.log('[' + Date.now() + '] set location started');
	var zoom = 8, paths = {
		// 'page name' : [min scroll, max scroll],
		'academy' : [ 800, 1100 ],
		'centers' : [ 600, 800 ],
		'buy' : [ 200, 700 ],
		'consultants' : [ 135, 1035 ]
	}, zooms = {
		// 'country/continent' : zoom (1-15)
		'russia' : 3,
		'canada' : 4,
		'usa' : 4,
		'argentina' : 5,
		'brazil' : 4,
		'mexico' : 5,
		'peru' : 5,
		'venezuela' : 5,
		'egypt' : 5,
		'kenya' : 5,
		'madagascar' : 5,
		'mali' : 5,
		'morocco' : 5,
		'mozambique' : 5,
		'nigeria' : 5,
		'rwanda' : 7,
		'southafrica' : 5,
		'sudan' : 5,
		'finland' : 4,
		'france' : 5,
		'unitedkingdom' : 5,
		'spain' : 5,
		'italy' : 5,
		'australia' : 4,
		'china' : 4,
		'india' : 4,
		'indonesia' : 5,
		'japan' : 5,
		'kazakhstan' : 4,
		'mongolia' : 5,
		'myanmar' : 5,
		'pakistan' : 5,
		'saudiarabia' : 5,
		'vietnam' : 5,
		'newzealand' : 5,
		'congothedemocraticrepublicofthe' : 5
	}, location = {
		// 'country/continent' : [+latitude, +longitude]
		'northamerica' : [ -7, 0 ],
		'africa' : [ 7, 0 ],
		'congo' : [ 5, -5 ],
		'latinamerica' : [ -8, 0 ]
	}, splitPath = window.location.pathname.replace(/^\//, '')
		.replace(/\/\/$/,'')
		.replace(/\/$/, '')
		.split('/');
	var path = splitPath[0];
	var popPath = splitPath[splitPath.length - 1];
	if (path == 'training')
		path = splitPath[1];
	if (getObjectKeyIndex(paths, popPath) == 0) {
		if (getObjectKeyIndex(zooms, popPath) > 0) {
			zoom = zooms[popPath];
		} else {
			if ((splitPath.length - 1) - splitPath.indexOf(path) == 1)
				zoom = 3;
			else
				zoom = 6;
		}
		try {
			var data_location = [];
			if(window.currentLocation) {
				data_location = window.currentLocation;
				if (getObjectKeyIndex(location, popPath) > 0) {
					data_location[0] += location[popPath][0];
					data_location[1] += location[popPath][1];
				}

				window.Lmap.setView(data_location, zoom);
				checkHeight(paths[path][0], paths[path][1]);
			}
		} catch (e) {}
	} else {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				try {
					var latLong = [
						position.coords.latitude,
						position.coords.longitude
					];
					window.Lmap.setView(latLong, zoom);
					checkHeight(paths[path][0], paths[path][1]);
					
					var path = window.location.pathname.replace(/^\//, '').replace(/\/\/$/, '').replace(/\/$/, '').split('/');
					if(path.length == 1 && path[0] == 'buy'){
						findCountry(position.coords.latitude, position.coords.longitude);
					}
				} catch (e) {}
			});
		}
	}
	//console.log('[' + Date.now() + '] set location finished');
};

function markerDecode(str){
	return decodeURIComponent(atob(str).split('').map(function(c){
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}

var icoDef,icoDist,icoRest,icoSxt,icoGray,icoGrad,icoClass,icoMumOld,icoMumNew,icoMumDOld,icoMumDnew;

function markerIcon( c ){
	if (typeof icoDef == "undefined"){
		let icoMSize = [8,8];
		let icoDefSize = [32,32];
		let urlLoc = 'https://i.mt.lv/img/map/';

		icoDef = new L.Icon.Default();
		icoDist = L.icon({
			iconUrl : urlLoc+'antenna_orange.png',
			iconSize : icoDefSize
		});
		icoRest = L.icon({
			iconUrl : urlLoc+'antenna_blue.png',
			iconSize : icoDefSize
		});
		icoSxt = L.icon({
			iconUrl : urlLoc+'antenna_green.png',
			iconSize : icoDefSize
		});
		icoGray = L.icon({
			iconUrl : urlLoc+'training_trainer.png',
			iconSize : icoDefSize
		});
		icoGrad = L.icon({
			iconUrl : urlLoc+'training_academy.png',
			iconSize : icoDefSize
		});
		icoClass = L.icon({
			iconUrl : urlLoc+'training_class.png',
			iconSize : icoDefSize
		});
		icoMumOld = L.icon({
			iconUrl : urlLoc+'dot_gray.png',
			iconSize : icoMSize
		});
		icoMumNew = L.icon({
			iconUrl : urlLoc+'dot_red.png',
			iconSize : icoMSize
		});
		icoMumDOld = L.divIcon({
			className : 'mumOldMarker2'
		});
		icoMumDNew = L.divIcon({
			className : 'mumNewMarker2'
		});
	}
	switch ( c ) {
		case 1: return icoDist; break;
		case 2: return icoRest; break;
		case 3:
		case 4: return icoGray; break;
		case 5: return icoGrad; break;
		case 6: return icoClass; break;
		case 7: return icoSxt; break;
		case 8: return icoMumDOld; break;
		case 9: return icoMumDNew; break;
		default: return icoDef; break;
	}
}

function initMap() {
	//console.log('[' + Date.now() + '] maploader finished, initing map');
	createCSS();

	vatrib = 'Tiles &copy; Esri';
	url = '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
	vmapzoom = 3;

	vmapobj = 'Lmap';
	vmapwidth = $('#' + vmapobj).width();
	configs = {};
	tileconfigs = {
		noWrap : false,
		detectRetina : true,
		subdomains : '1234',
		attribution : vatrib
	};
	defaultview = [
		51.067485, 12.227292
	];

	if (typeof mapData == 'object') {
		if (typeof mapData.vmapobj != 'undefined')
			vmapobj = mapData.vmapobj;
		if (typeof mapData.configs != 'undefined')
			configs = mapData.configsj;
		if (typeof mapData.url != 'undefined')
			url = mapData.url;
		if (typeof mapData.tileconfigs != 'undefined')
			tileconfigs = mapData.tileconfigs;
		if (typeof mapData.defaultview != 'undefined')
			defaultview = mapData.defaultview;
		if (typeof mapData.setZoom != 'undefined')
			vmapzoom = mapData.setZoom;
		elt = document.createElement('div');
	}
	if (vmapwidth > 1024) {
		tileconfigs["scrollWheelZoom"] = false;
		tileconfigs["touchZoom"] = false;
		tileconfigs["doubleClickZoom"] = false;
		tileconfigs["boxZoom"] = false;
	} else {
		configs.fullscreenControl = true;
		configs.fullscreenControlOption = {
			position : "topleft"
		};
	}
	/* map base */
	var map = L
		.map(vmapobj, configs)
		.setView(defaultview, vmapzoom)
		.addLayer( L.tileLayer(url, tileconfigs) )
		.setMaxBounds([ [ 84.67351256610522, -174.0234375 ], [ -58.995311187950925, 223.2421875 ] ]);

	if (vmapwidth > 1024) {
		map.scrollWheelZoom.disable();
	}
	if (omstool) {
		var oms = new OverlappingMarkerSpiderfier(map);
		var omsbounds = new L.LatLngBounds();
	}
	var conf_popup={closeButton:false,offset:new L.point(0.5, -24)};
//console.log('length - '+markers.length);
	/* cluster */
	if (markers.length > 0) {
		if (cluster) {
			cRadius = 80;
			if (typeof customClusterRadius != "undefined")
				cRadius = customClusterRadius;
			mcluster = L.markerClusterGroup({ showCoverageOnHover : false, maxClusterRadius : cRadius });
		}
		//console.log('[' + Date.now() + '] markers sorting started');
		for (id in markers) {
			let mtitle = '', mdescr = '';
			let catdescr = 0;
			if (typeof markers[id].h != "undefined"){
				mtitle = markerDecode(markers[id].h.t);
				catdescr = 1;
				if (typeof markers[id].h.u != "undefined" ){
					//mdescr = '<a href="'+markerDecode(markers[id].h.u)+'">'+mtitle+'</a>';
					catdescr = 3;
				} // else {
				//	mdescr = mtitle;
			//	}
			/*	mdescr = '<div>'+mdescr+'<br/><span style="font-size:0.8em">'
					+markerDecode(markers[id].h.a)+', '
					+'<b>'+markerDecode(markers[id].h.c)+'</b>'
					+'<br/>Tel:'+markerDecode(markers[id].h.p)
					+'</span></div>';
			*/
			} else if (typeof markers[id].tt != "undefined") {
				mtitle = markers[id].tt;
				catdescr = 2;
				//mdescr = '<div>'+markers[id].ic+'</div>';
			}
//console.log(markers[id],markers[id].h,markers[id].h.t);
//console.log(mtitle,mdescr);
			let cico = markerIcon(markers[id].im);
			let pcfg = { icon : cico, lightIcon : cico, title : mtitle };
//console.log('adding marker',id,pcfg);
			fm = L.marker([ markers[id].la, markers[id].lo ], pcfg)
			.on('click',function(ev){
				//console.log('opening click',ev,id,this);
				//console.log('id = ',ev.sourceTarget.specialId);
				let cid = this.specialId;
				let cty = this.specialType;
				let cmar = markers[ cid ];
				let descr = '';
				if (cty==1 || cty==3){
					descr = this.options.title;
					if (cty==3){
						descr = '<a href="'+markerDecode(cmar.h.u)+'">'+descr+'</a>';
					}
					descr = '<div>'+descr+'<br/><span style="font-size:0.8em">'
						+markerDecode(cmar.h.a)+', '
						+'<b>'+markerDecode(cmar.h.c)+'</b>'
						+'<br/>Tel:'+markerDecode(cmar.h.p)
						+'</span></div>';
				} else if (cty==2){
					descr = '<div>'+cmar.ic+'</div>';
				}
				if (descr != ''){
					this.bindPopup( descr );
					this.openPopup();
				}
			})
			.on('popupclose',function(ev){
				this.unbindPopup();
			});
			fm.specialId = id;
			fm.specialType = catdescr;
				 //.addTo(map);
			if (omstool){
				//fm.desc = mdescr;
				fm.addTo(map);
				oms.addMarker(fm);
			} else if (cluster) {
				//fm.bindPopup( mdescr );
				mcluster.addLayer(fm);
			}
		}
		//console.log('[' + Date.now() + '] markers sorting finished');
		if (cluster) {
			map.addLayer(mcluster);
		} else if (omstool) {
			var popup = new L.Popup( conf_popup );
			oms.addListener('click', function(markz) {
				popup.setContent(markz.desc);
				popup.setLatLng(markz.getLatLng());
				map.openPopup(popup);
			});
			oms.addListener('spiderfy', function(markz) {
				//for(var i=0,len=markz.length;i<len;i++){ }
				map.closePopup();
			});
			oms.addListener('unspiderify', function(markz) {
				//for(var i=0,len=markz.length;i<len;i++){ }
			});
			map.fitBounds(omsbounds);
		}
	}
	if (typeof mapData == 'object') {
		if (typeof mapData.setZoom != 'undefined')
			map.setZoom(mapData.setZoom);
	}
	//if (omstool){
	//	map.fitBounds(omsbounds);
	//}
	window.Lmap = map;
	window.setLMapLocation();

}

function findCountry(lat, lng){
    var list = $('[data-location]'); 
    var ll = parseInt(lat);
    var ln = parseInt(lng);
	$.each(list, function(){
		var bb = $(this);
		var t = $(this).data('location');
		var sp = t.split(';');
		var sll = parseInt(sp[0]);
		var sln = parseInt(sp[1]);

		if(ll == sll && ln == sln){
			$('.listing li ul').hide();
			$('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
			bb.closest('ul').show();
			bb.closest('ul').parent().find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');
			bb.click();
		}
	});
}

function createCSS() {
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerhtm = '.mumOldMarker2,.mumNewMarker2{width:18px !important;height:22px !important;}'
	+ ' .mumOldMarker2{background: url(//i.mt.lv/img/mum/markers.png) no-repeat 0 -22px; z-index:1;}'
	+ ' .mumNewMarker2{background:url(//i.mt.lv/img/mum/markers.png) no-repeat; z-index:10;}';
	document.getElementsByTagName('head')[0].appendChild(style);
}
window.addEventListener("load",function(event){ /*console.log('[' + Date.now() + '] maploader starts');*/ startCounting(); });
