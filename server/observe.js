//Things that are being "observed" from server
//These can run forever, hence the separate file

//meteor-user-status package
UserStatus.events.on("connectionLogout", function(fields) {
  var user = Meteor.users.findOne({ _id:fields.userId });
  Meteor.users.update( user._id, { $set: {
    'profile.playing': {
      'playlist': null,
      'playlistIndex': null,
      'status': 'stopped',
      'modified': new Date(),
    } } } );
});
