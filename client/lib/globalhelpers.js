Handlebars.registerHelper('fromNow', function(input){
	if (input) {
		return moment(input).fromNow();
	} else {
		return "no Date";
	}
});