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

Playlists.allow({
  //Everyone can create new playlists
  insert: function(userId, doc) {
    return true;
  },
  //only check if we're updating songs; if so, find out if this allowed
  update: function (userId, doc, fields, modifier) {
  console.log(userId, " wants to modify ", fields, " of ", doc.privacy, " playlist by ", doc.owner);
  	if( _.contains(fields, 'songs')) {
      if(doc.privacy == "public") { return true; }
      else if((doc.privacy == "viewonly" || doc.privacy == "private") && doc.owner == userId) { return true; }
      else { console.log("this user can't edit these playlists"); return false;  }
    }  
    console.log("not editing songs");
    //for now, other fields can be edited without problems...
    return true;
  },
  //only remove if owner equals user id
  remove: function (userId, doc) {
    return doc.owner == userId;
  },
  //important fields for permissions
  fetch: ['owner','privacy']
 });
