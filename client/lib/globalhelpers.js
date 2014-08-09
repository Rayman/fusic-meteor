Handlebars.registerHelper('fromNow', function(input){
  if (input) {
    return moment(input).fromNow();
  } else {
    return "no Date";
  }
});


Handlebars.registerHelper('formatDuration', function(input){
  //Format PT15M51S --> 15 minutes 51 seconds
  var duration = moment.duration(input || 0);
  var time = moment.utc(duration.asMilliseconds());
  if (duration.asHours() >= 1) {
    return time.format('HH:mm:ss');
  } else {
    return time.format('mm:ss');
  }
});

Handlebars.registerHelper('username', function(user){
  if (!user)
    return;
  if (user.username)
    return user.username;
  if (user.emails) {
    if (user.emails.length > 0)
      return user.emails[0].address;
    else
      return;
  }
});

Handlebars.registerHelper('privacyIcon', function(playlist) {
  var icon = "globe";
  if(this.privacy == "viewonly")  { icon = "eye-open"; }
  if(this.privacy == "private")   { icon = "lock"; }

  return '<span class="glyphicon glyphicon-'+ icon +'"></span>';
});

Handlebars.registerHelper('avatarUrl', function(user) {
  if(user.profile.avatar) {
    return user.profile.avatar;
  } else {
    return "/img/avatar.jpg";
  }
});

Handlebars.registerHelper('currentRoute', function() {
	var currentRoute = Router.current();
	if (!currentRoute) { return ''; } else {
		return Router.current().route.name;
	}
});

Handlebars.registerHelper('sessionIs', function(p1, p2) {
    return Session.get(p1) === p2;
});


Template.circleAvatar.rendered = function() {
    $('div.avatar').tooltip();
}
