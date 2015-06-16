
/**
 * All functions (not template helpers, not event maps)
 * related to the importSpotifyModal
 */
var importSpotifyModal = {

  apiOptions: {
    showDialog: true, // Whether or not to force the user to approve the app again if they’ve already done so.
    requestPermissions: ['user-read-email', 'user-library-read'] // Spotify access scopes.
  },

  /**
   * open modal and initialize data
   */
  open : function() {
    var self = this;

    Spotify.requestCredential(this.apiOptions, function(key) {
      //if access token has been acquired, open modal, load favourite songs
      $("#import-spotify").modal('show');

      self.key = key;
      // self.offset = 0;
      self.limit  = 50;

      self.getSavedTracks.call(self);
    });
  },

  /**
   * Close the modal
   */
  close: function() {
    $("#import-spotify").modal('hide');
  },

  /**
   * Reactive function to update saved tracks from Spotify API
   */
  getSavedTracks: function() {
    var self = this;
    Meteor.call("spotifyGetSavedTracks", this.key, this.template.offset.get(), this.limit, function(err, result) {
      self.template.max.set(result.total);
      Session.set("spotifySavedTracks",result.items);
    });
  },

  /**
   * @TODO make this modal work for importing playlists as well
   */
  getSavedPlaylists: function() {

  },

  /**
   * Page through saved tracks
   */
  loadNext: function() {
    var tpl = this.template;
    tpl.offset.set( tpl.offset.get() + this.limit);
    this.getSavedTracks();
    tpl.pageNr.set(tpl.pageNr.get("pageNr") + 1);
  },
  loadPrev: function() {
    var tpl = this.template;
    tpl.offset.set( tpl.offset.get() - this.limit );
    this.getSavedTracks();
    tpl.pageNr.set(tpl.pageNr.get("pageNr") - 1);
  },

  /**
   * Add an array of videoIds to loved songs
   */
  addtoLovedSongs : function(videoIds) {
    Meteor.users.update(
      { _id: Meteor.userId() },
      { $addToSet : { 'profile.lovedSongs': { $each: videoIds} } }
    );
  },

  /**
   * @TODO make modal work with importing playlists
   */
  addtoPlaylists : function() {

  }

};

Template.importSpotifyModal.onCreated( function() {
  this.modal = importSpotifyModal;
  this.modal.template = this;
  this.modal.open();

  this.max    = new ReactiveVar(0);
  this.offset = new ReactiveVar(0);
  this.pageNr = new ReactiveVar(0);
});


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
  },
  multiPage: function() {
    var tmpl = Template.instance();
    if(!tmpl.max) { return false; }
    return tmpl.max.get() > tmpl.modal.limit;
  },
  nrOfTracks: function() {
    var tmpl = Template.instance();
    if(tmpl.max) {
      return tmpl.max.get();
    } else { return 0; }
  },
  isNextPage: function() {
    var tmpl = Template.instance();
    if(tmpl.offset.get() + tmpl.modal.limit < tmpl.max.get() ) {
      return "";
    } else {
      return "disabled";
    }
  },
  isPrevPage: function() {
    var tmpl = Template.instance();
    if(tmpl.offset.get() <= 0) { return "disabled"; }
  },
  pageNr : function() {
    return Template.instance().pageNr.get();
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

  'click .action-get-next' : function(event, template) {
    Template.instance().modal.loadNext();
  },
  'click .action-get-prev' : function(event, template) {
    Template.instance().modal.loadPrev();
  },


  'click .action-import' : function(event) {
    var form =$(event.currentTarget).parents('form'),
        counter = 0,
        ids = [],
        checked = form.find("input:checked"),
        tpl = Template.instance();

    //can't press import button more than once
    $(event.currentTarget).prop("disabled", true);

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
          tpl.modal.addtoLovedSongs(ids);
          Session.set("importStatus", "Import complete! You can close this window");
        }
      });
    });
  }
};
