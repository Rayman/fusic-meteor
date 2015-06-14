var refreshSuggestions = function() {
    //hack to make calls to Hypemachine API when selecting this "genre"
    var apiCall = (Session.get("suggestion-genre") === "hypemPopular") ?  Session.get("suggestion-genre") : "hotRightNow";
    Meteor.call(apiCall, Session.get("suggestion-genre"), function(error,result) {
    if(error) { console.log(error); return; }
    Session.set("suggestions", result);
  });
};

/**
 * GLOBAL SCOPE From a youtube query, return video id matching the most fitting video
 */
songIdFromQuery = function( query, callback ) {
  //prepare query for Youtube
  var options = {
    part: 'id',
    type: 'video',
    videoEmbeddable: 'true',
    q: query
  };
  //perform Youtube search using artist and song information
  Meteor.call('youtube_search', options, function(error, data) {
    if (error) { return false; }

    //Id from first search result
    var videoId = (data.items.length > 0) ? data.items[0].id.videoId: null;

    //Fetch extra info, put it in songcache
    var options = {
      'part': 'snippet,contentDetails,statistics',
      'id': videoId,
    };
    Meteor.call('youtube_videos_list', options);

    //after search completes, call the callback with the videoId
    callback.call(this, videoId);

  });
};

/**
 * Add best matching result from youtub query to a defined playlist
 */
var addSongfromQuery = function(query, playlistId) {

  songIdFromQuery( query, function( videoId ){

      //Put videoId in current playlist
      var songObject = {
        "added" : new Date(),
        "author" : Meteor.userId(),
        "songId" : videoId
      };

      Playlists.update(
        { _id: playlistId},
        { $push: { songs: songObject} }
      );
  });
};


Template.suggestions.created = function() {
  Session.set("suggestion-genre","alternative rock");
  refreshSuggestions();
};

Template.suggestions.helpers({
  "songs" : function() {
    return Session.get("suggestions");
  }
});

Template.suggestions.events = {
  'click button#refreshSuggestions' : refreshSuggestions,

  'click .suggestion-genres li' : function(e) {
    var genre = (e.target.getAttribute("data-genre") !== null) ? e.target.getAttribute("data-genre") : e.target.text.toLowerCase();
    Session.set("suggestion-genre",genre);
    console.log(e);
    $(".suggestion-genres li").removeClass("active");
    $(e.currentTarget).addClass("active");
    refreshSuggestions();
  },

  'click #addSong': function (e,template) {
    var playlistId = Router.current().params._id;
    addSongfromQuery( this.artist_name + " " + this.title, playlistId);


  },
};
