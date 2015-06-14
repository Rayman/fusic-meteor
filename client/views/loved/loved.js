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
    var options = {
      showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
      requestPermissions: ['user-read-email', 'user-library-read'] // Spotify access scopes.
    };

    Spotify.requestCredential(options, function(key) {
      //if access token has been acquired, open modal, load favourite songs
      $("#import-spotify").modal('show');
      Meteor.call("spotifyGetSavedTracks", key, function(err, result) {
        Session.set("spotifySavedTracks",result.items);
      });
    });
  },
  'click .action-select-all' : function(event) {
    var form =$(event.currentTarget).parent('form');
    form.find("input").prop("checked", true);
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
          console.log(ids);
          addtoLovedSongs(ids);
        }
      });
    });

  }
};

/**
 * Add an array of videoIds to loved songs
 */
var addtoLovedSongs = function(videoIds) {
  Meteor.users.update(
    { _id: Meteor.userId() },
    { $addToSet : { 'profile.lovedSongs': { $each: videoIds} } }
  );
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

  }
};
