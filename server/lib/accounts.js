//User Creation
Accounts.onCreateUser(function(options, user) {
  // accounts-password doesn't create a profile
  user.profile = options.profile ? options.profile : {};

  //empty array so that $addtoset can be used in mongo
  user.profile.lovedSongs = [];
  //url to avatar
  user.profile.avatar = null; 
  //array object for friends
  user.profile.friends = [];
  
  return user;
});

//Username validation
// Validate username, sending a specific error message on failure.
Accounts.validateNewUser(function (user) {
  var blackList = [
			'root',
			'admin',
			'default'
			];
	if (blackList.indexOf(user.username) != -1) {
		throw new Meteor.Error(403, "Not a valid username, choose something more personal ;)");
	}	
	
	if (user.username && user.username.length >= 3) {
		return true;
	}
  throw new Meteor.Error(403, "Username must have at least 3 characters");
});