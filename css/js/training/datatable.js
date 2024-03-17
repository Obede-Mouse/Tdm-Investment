let map = null,
	marker = null,
	table = null,
	g_p1 = -1,
	g_p2 = 6,
	g_mum_id = null,
	mum_picker = null;

$(document).ready(function () {

	let continent_picker = $('#continent_picker'),
		year_picker = $('#year_picker'),
		trainingTable = $('#trainings'),
		page_lenght = 30;
	let searchString = getUrlVars()['s'];
	mum_picker = $('#select-mum');

	let originalAddClassMethod = jQuery.fn.addClass;
	jQuery.fn.addClass = function () {
		let result = originalAddClassMethod.apply(this, arguments);
		jQuery(this).trigger('cssClassChanged');
		return result;
	};

	// fill select with future mums
	$.ajax({
		url: window.location.href,
		type: 'POST',
		data: {
			ax: 'get_mum'
		},
		success: function (data) {
			mum_picker.html(data);
		}
	});

	if (!year_picker.length) page_lenght = -1;
	// Getting current opened tab
	g_p2 = $('#continent_picker .tab-title.active a').data('id');
	let options = {
		"order": [[0, "asc"]],
		"dom": 'flrtipB',
		"buttons": {
			"buttons": [
				{
					extend: 'copy',
					className: 'tiny margin-right button round',
					exportOptions: {
						format: {
							body: function (date, rowId, colId, html) {
								let $html = $(html);
								let extra = $html.children('a').attr('href');
								return $html.text() + (extra ? ' - ' + extra : '');
							}
						}
					},
				},
				{extend: 'csv', className: 'tiny margin-right button round'},
				{extend: 'print', className: 'tiny margin-right button round'}
			]
		},
		'ajax': {
			'url': window.location.href,
			'type': 'POST',
			'data': function (d) {
				d.ax = 'datatable';
				if (g_mum_id)
					d.mum = g_mum_id;
				d.p1 = g_p1;
				d.p2 = g_p2;
			}
		},
		"createdRow": function (row, data) {
			// if column 6 is set, then add it as row class
			if (data[6])
				$(row).addClass(data[6]);
			if (data[4]) {
				let col3_childrens = $(row).children().eq(3).children();
				if (col3_childrens.length > 1)
					col3_childrens.eq(0).attr('style', 'padding-right:30px;overflow:hidden;white-space:nowrap;');
			}
			if (data[3]) {
				let col2_childrens = $(row).children().eq(2).children();
				if (col2_childrens.length > 1)
					col2_childrens.eq(0).attr('style', 'padding-right:30px;overflow:hidden;white-space:nowrap;');
			}
		},
		'initComplete': drawFilter,
		"oSearch": {"sSearch": searchString}
	};
	if (year_picker.length) {
		options.pageLength = page_lenght;
		options.lengthMenu = [[10, 20, 30, 50, 100, -1], [10, 20, 30, 50, 100, "All"]];
	} else
		options.paging = false;
	table = trainingTable.DataTable(options);

	mum_picker.change(function () {
		let value = mum_picker.find(':selected').val();
		if (value) {
			$('#continent_picker .active').removeClass('active');
			updateTable(null, null, value);
			let paths = window.location.pathname.replace(/^\//, '').replace(/\/\/$/, '').replace(/\/$/, '').split('/');
			if (paths[paths.length - 1] !== 'training')
				paths.pop();
			paths.push(value);
			window.history.replaceState("", "", "/" + paths.join("/"));
		} else if (value === "") {
			$('.active-def a').click().trigger('change');
		}
	});

	continent_picker.on('cssClassChanged', ".tab-title.active", function () {
		updateTable(null, $(this).find('a').attr('data-id'));
	});
	year_picker.on('cssClassChanged', ".tab-title.active", function () {
		updateTable($(this).find('a').attr('data-y'), null);
	});
	continent_picker.on("click", ".tab-title a", function () {
		$(this).parent().parent().find('.tab-title').removeClass('active');
		$(this).parent().addClass('active');
		return false;
	});
	year_picker.on("click", ".tab-title a", function () {
		$(this).parent().parent().find('.tab-title').removeClass('active');
		$(this).parent().addClass('active');
		return false;
	});
	trainingTable.on("click", '.open-map', function () {
		openMap($(this).attr('data-lat'), $(this).attr('data-lon'));
	});
	trainingTable.on("click", '.bbcode', function () {
		openDescription(BBCode2HTML($(this).attr('data-show-bbcode').toString()));
	});
});

function getUrlVars() {
	let vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		vars[key] = value;
	});
	return vars;
}

function BBCode2HTML(text) {
	text = $($.parseHTML(text)).text();
	text = text.replace(/\[url=(.*?)(?=])/g, '<a href="$1"').replace(/\[url](.*?)(?=\[\/)/g, '<a href="$1" >$1');
	return text.replace(/(\[\/url])/g, '</a>').replace(/(\[)/g, '<').replace(/(])/g, '>');
}

function openDescription(html) {
	$('#description').html(html);
	$('#description_modal').foundation('reveal', 'open');
}

function openMap(lat, lon) {
	if (!lat || !lon) return;
	let location = [parseFloat(lat), parseFloat(lon)];
	if (map) {
		map.removeLayer(marker);
		map.setView(new L.LatLng(parseFloat(lat), parseFloat(lon)), map.getZoom());
	} else {
		map = L.map('map').setView(location, 14);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	}

	marker = L.marker(location).addTo(map);

	$('#map_location').foundation('reveal', 'open');
	// iekš modal mapi vajag resize, lai karte pareizi ielādētos
	setTimeout(function () {
		map.invalidateSize()
	}, 400);
}

function updateTable(p1, p2, mum_id) {
	if (p1 !== null)
		g_p1 = parseInt(p1);
	if (p2 !== null)
		g_p2 = parseInt(p2);
	if (mum_id) {
		g_mum_id = mum_id;
	} else {
		let picker = $('#select-mum');
		if (picker)
			picker.find(':selected').attr('selected', false);
		g_mum_id = null;
	}
	table.search('').columns().search('').draw();
	table.ajax.reload(drawFilter);
}

function drawFilter() {
	let filter = $('#filter');
	filter.find('th').each(function (index) {
		if (index < 1 || index > 4) return; // remove unnecessary filters
		index++;
		let obj = $(this);
		let select = obj.find('select');
		if (!select.length) {
			select = $('<select><option value=""></option></select>').appendTo(obj).on('change', function () {
				let val = $(this).val();
				table.columns(index).search(val ? val : '').draw();
			}).attr('style', 'margin:0;padding:0 5px;height:25px');
		} else {
			select.html('<option value=""></option>');
		}
		let array = table.columns(index).data().eq(0).map(function (d) { // remove all html tags
			return $($.parseHTML(d)).text().trim();
		});
		if (index === 2) { // get unique certificate type
			let uniqueArray = [];
			array.sort().unique().each(function (d) { // select only unique values
				let split = d.split(', ');
				for (let i in split) {
					if (!split.hasOwnProperty(i)) continue;
					let value = split[i];
					if ($.inArray(value, uniqueArray) === -1) { // if not exists in array then add
						uniqueArray.push(value);
					}
				}
			});
			for (let i in uniqueArray.sort()) {
				select.append('<option value="' + uniqueArray[i] + '">' + uniqueArray[i] + '</option>');
			}
		} else if (index === 3) { // get unique certificate type
			let uniqueLoc = [];
			let new_array = array.sort().unique();
			new_array.each(function (el, index) { // select only unique values
				let country = el.toString().split(', ')[0];
				// if not exists in array then add
				if ($.inArray(country, uniqueLoc) === -1) {
					uniqueLoc.push(country);
					select.append('<option value="' + country + '">' + country + '</option>');
					if (index !== new_array.length - 1) {
						if (new_array[index + 1].split(', ')[0] === country)
							select.append('<option value="' + el + '">' + el + '</option>');
					}
				} else
					select.append('<option value="' + el + '">' + el + '</option>');
			});
		} else {
			array.sort().unique().each(function (d) { // select only unique values
				select.append('<option value="' + d + '">' + d + '</option>');
			});
		}
	});
	table.columns.adjust().draw();
}
