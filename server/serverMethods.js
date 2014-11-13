Meteor.methods({
  getLovedSongs: function() {
    if(!this.userId)
      throw new Meteor.Error(404, "No one is logged in");

    var user = Meteor.user();
    //find song info in the cache for each song
    return Songs.find({_id: {$in: user.profile.lovedSongs} }).fetch();
  }
});
