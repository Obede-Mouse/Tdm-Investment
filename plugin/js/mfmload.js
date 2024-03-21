$(document).ready(function() {

	$("#mfm-how-to-apply").hide();$("#mfm-triger").click(function(){$("#mfm-how-to-apply").slideToggle("fast");});
	var query = window.location.href,vars = query.split("/"),link=null,ind=0;

	for (var i = 0; i < vars.length; i++) {
		if (vars[i] == 'accessories') link = 1;
		if (vars[i] == 'integrators') link = 2;
		if (vars[i] == 'software') link = 3;
		if (vars[i] == 'cpe') link = 4;
		if (vars[i] == 'books') link = 5;
		ind++;
	}

	if (link > 0) setTimeout(function() { $('a[href="#panel2-' + link + '"]').click(); }, 110);
	initmfm();

});
function initmfm(){
	if(typeof $(document).foundation == "function"){
		$("img.mfmimg").each(function(){$(this).click(function(){openModal($(this).data("img"));});});
	} else {window.setTimeout(function(){initmfm();},5);}
}
function openModal(img){
	$(document).foundation();
	$("#mfmmodal").htm('<div style="text-align:center;"><img src="'+img+'" alt=""/></div><a id="mfmclose" class="close-reveal-modal" aria-label="Close">&#215;</a>');
	$("#mfmmodal").foundation("reveal","open");
	$("#mfmclose").click(function(){$("#mfmmodal").foundation("reveal","close");});
}
function mfmurl(id){window.history.replaceState(null, null, "/mfm?mfm_category="+id);}
