Template.loved.events = {
  'click [data-action="remove"]': function (e) {
  	//loved songs are stored in users profile
  	Meteor.users.update(
                      { _id: Meteor.userId()	},
                      { $pull : { 'profile.lovedSongs': this._id }}
                    );
  },
  'mouseenter p' : function(event, template) {
  	$(event.target).find(".songoptions").removeClass("hidden");
  },
  'mouseleave p' : function(event, template) {
  	$(event.target).find(".songoptions").addClass("hidden");
  },

  //Get Spotify access token and fetch users playlists with it
  'click .import-spotify': function(event) {
    //All kinds of ways to trigger a template out of the blue,
    //theres  little information about what is 'the right way'
    Blaze.render(Template.importSpotifyModal,$('body')[0], null, Blaze.getView());
    // Blaze.render(Template.importSpotifyModal, $('body')[0]);
    // new Blaze.View(Template.importSpotifyModal)
  }
};
