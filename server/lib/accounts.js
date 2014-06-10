//User Creation
Accounts.onCreateUser(function(options, user) {
  // accounts-password doesn't create a profile
  user.profile = options.profile ? options.profile : {};

  //empty array so that $addtoset can be used in mongo
  user.profile.lovedSongs = [];
  return user;
});