Meteor.users.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change username once
	var old = Meteor.users.findOne(userId).username;
	console.log("current username: ", old ,"\tnew username: ", doc.username);
	if( _.contains(fields, 'username') &&
		(doc.username == null || doc.username == "")) { //if username hasn't been set
			return true;
		}
	else if ( _.contains(fields, 'profile')) {
		return true;
	} else {
		return false;
	}
  },
  remove: function (userId, doc) {
    return false;
  },
  fetch: ['username']
});