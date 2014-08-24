Template.header.rendered = function() {
	//apparantly still the easiest way to make slight adjustments to accounts-ui package
	setTimeout(function(){
		var html = '<span class="glyphicon glyphicon-user"></span>';
    var current = $("#login a.dropdown-toggle").html();
    html = html + current;
		$("#login a.dropdown-toggle").html(html);
	}, 3000);

}

Template._loginButtonsAdditionalLoggedInDropdownActions.user = function(){
  return Meteor.user();
}
