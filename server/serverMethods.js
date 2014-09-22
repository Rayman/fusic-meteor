Meteor.methods({
  //retrieves all playlists set to "private" from currently logged in user
  getPrivatePlaylists: function () {
    if (!this.userId)
      throw new Meteor.Error(404, "No one is logged in");

    //return as static object, just to check if everything works
    return Playlists.find({'owner':this.userId, 'privacy' : 'private'}).fetch();
  },
  getLovedSongs: function() {
    if(!this.userId)
      throw new Meteor.Error(404, "No one is logged in");

    var user = Meteor.user();
    //find song info in the cache for each song
    return Songs.find({_id: {$in: user.profile.lovedSongs} }).fetch();
  }
});
