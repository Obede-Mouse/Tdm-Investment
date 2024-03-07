$(document).ready(function(){

	var body = $('#changelogs');
	body.on('click', '[data-toggle-tabs]', function (e){
		e.preventDefault();
		var that = $(this), tab_id = that.attr('data-toggle-tabs'), texts = that.text();

		if (texts === 'Expand') {
			that.text('Collapse');
			$('#e_' + tab_id + ' li.accordion-navigation:not(.active) a').trigger('click');
		}

		if (texts === 'Collapse') {
			that.text('Expand');
			$('#e_' + tab_id + ' li.accordion-navigation.active a').trigger('click');
		}
	});

	body.find('[data-load-ajax]').click(function() {
		var that = $(this), target_content = $(that.attr('href')), val = that.attr('data-load-ajax');
		if(target_content.is(':empty') && val) {
			target_content.html('<span class="text-center"><div class="loader"></div></span>');
			$.ajax({
				data: { "ax": 'loadLog', "val": val },
				success: function(data) {
					target_content.html('<p style="margin:0">' + data.replace(/\n/g, "<br />") + '</p>');
				}
			});
		}
	});

});
