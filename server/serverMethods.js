Meteor.methods({
  //retrieves all playlists set to "private" from currently logged in user
  getPrivatePlaylists: function () {
    if (!this.userId)
      throw new Meteor.Error(404, "No one is logged in");
    
    //return as static object, just to check if everything works
    return Playlists.find({'owner':this.userId, 'privacy' : 'private'}).fetch();
  }
});