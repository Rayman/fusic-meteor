Template.header.rendered = function() {
	//apparantly still the easiest way to make slight adjustments to accounts-ui package
	setTimeout(function(){
		var html = '<span class="glyphicon glyphicon-user"></span>';
		$("#login a.dropdown-toggle").html(html);
	}, 3000);

}