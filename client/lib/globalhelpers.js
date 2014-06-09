Handlebars.registerHelper('fromNow', function(input){
	if (input) {
		return moment(input).fromNow();
	} else {
		return "no Date";
	}
});


Handlebars.registerHelper('formatDuration', function(input){
	//Format PT15M51S --> 15 minutes 51 seconds
	var time = input || "";
	return time.replace("PT","").replace("H",":").replace("M",":").replace("S","");
});