
/**
 * All functions (not template helpers, not event maps)
 * related to the importSpotifyModal
 */
importSpotifyModal = {

  apiOptions: {
    showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
    requestPermissions: ['user-read-email', 'user-library-read'] // Spotify access scopes.
  },

  /**
   * open modal and initialize data
   */
  open : function() {

    Spotify.requestCredential(this.apiOptions, function(key) {
      //if access token has been acquired, open modal, load favourite songs
      $("#import-spotify").modal('show');
      Meteor.call("spotifyGetSavedTracks", key, function(err, result) {
        Session.set("spotifySavedTracks",result.items);
      });
    });
  },

  /**
   * Add an array of videoIds to loved songs
   */
  addtoLovedSongs : function(videoIds) {
    Meteor.users.update(
      { _id: Meteor.userId() },
      { $addToSet : { 'profile.lovedSongs': { $each: videoIds} } }
    );
  }

};



Template.importSpotifyModal.helpers({
  spotifySavedTracks: function() {
    return Session.get("spotifySavedTracks");
  },
  getArtist: function(track) {
    return track.artists[0].name;
  },
  songPreview: function() {
    var previewUrl = this.track.preview_url;
    return '<audio class="previewTrack" controls><source src="'+previewUrl+'" type="audio/mpeg"></audio>';
  },
  importStatus: function() {
    return Session.get("importStatus");
  }
});

Template.importSpotifyModal.events = {
  'click .action-select-all' : function(event, template) {
    var target = $(event.currentTarget);
    target.toggleClass("all");
    if (target.hasClass("all")) {
      template.$("input[type=checkbox]").prop("checked", true);
      target.text("Select none");
    } else {
      template.$("input[type=checkbox]").prop("checked", false);
      target.text("Select all");
    }
  },

  'click .action-import' : function(event) {
    var form =$(event.currentTarget).parents('form'),
        counter = 0,
        ids = [],
        checked = form.find("input:checked");

    checked.each(function() {
      var song = $(this),
          query = song.data("artist") + " " + song.data("title");

      songIdFromQuery(query, function(videoId) {
        //Add video Id to preliminary output array
        ids.push(videoId);

        //update import progress
        counter++;
        Session.set("importStatus", "Imported "+ counter +"/"+ checked.length + " songs");

        //if all songs have been linked to a youtube counterpart, add them to loved songs
        if(counter === checked.length) {
          importSpotifyModal.addtoLovedSongs(ids);
        }
      });
    });
  }
};
