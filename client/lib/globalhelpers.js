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

Handlebars.registerHelper('avatar', function(id){
  if(Meteor.users.findOne(id) == null) { return; }
  var avatar = Meteor.users.findOne(id).profile.avatar;
  var url="/img/avatar.jpg"
  if (avatar) {
    var url=avatar;
  }
  return '<img class="img-circle img-responsive avatar" src="'+url+'">';
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
