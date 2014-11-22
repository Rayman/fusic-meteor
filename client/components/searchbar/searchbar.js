// initialize active_tab
Session.set('active_tab', 'songs');

//Initialisation of searchbar component,
// template example:
// {{> searchBar lovedToggle=0 viewToggle=0 collection="Playlists" playlistId=this._id }}
/*--------------------------
  Available parameters
  collection  (Collection)  Name of the collection to add objects to, requires extra code in
                            the add function, or sh*t will hit the fan (default: Playlists)
  playlistId  (int)         pointer to which playlist songs should be added (required)
  viewToggle  (boolean)     show/hide the toggle view buttons (default: show)
  lovedToggle (boolean)     show/hide the add songs from loved songs button (default: show)
---------------------------*/

Template.searchBar.created = function( template ) {
  //debug purposes
  var d = Template.currentData() || {}; //at least return an obj
  this.collection  = (typeof d.playlistId !== "undefined") ? window[d.collection] : window.Playlists;
  this.playlistId  = (typeof d.playlistId !== "undefined") ? d.playlistId : null;
  this.lovedToggle = (typeof d.lovedToggle !== "undefined") ? d.lovedToggle : 1;
  this.viewToggle  = (typeof d.viewToggle !== "undefined") ? d.viewToggle : 1;


  this.lovedToggleWidth = (this.lovedToggle === 1) ? 1 : 0;
  this.viewToggleWidth  = (this.viewToggle === 1) ? 2 : 0;
  this.searchBarWidth = 12 - this.lovedToggleWidth - this.viewToggleWidth;
  console.log(this);

};

Template.searchBar.helpers({
  isActiveTab: function(route) {
    return Session.equals("active_tab", route) ? "active" : "";
  },
  lovedSongs: function() {
    var user = Meteor.user();
    if (!user)
      return;
    return Songs.find({_id: {$in: user.profile.lovedSongs} });
  },
  //get local template parameters (non-reactive)
  param: function(parameter) {
      return Template.instance()[parameter] || "";
  }
});


Template.searchBar.events = {
  'click ul.playlist-tabs > li': function (e) {
    var li = $(e.currentTarget);
    var route = li.data('id');
    Session.set("active_tab", route);
  },
  'submit form.youtube-search': function (e) {
    e.preventDefault();
  },
  'input input.youtube-query': function (e) {
    var input = $(e.currentTarget);
    youtubeSearch(input.val());
  },
  //hide/show results window
  'focus input.youtube-query' : function(e) {
    var results = $("#searchresults");
    if(!results.is(":visible")) {
      results.fadeIn('fast');
    }
  },
  'click button[data-toggle="clearResults"]': function(e) {
    $("input.youtube-query").val("");
    searchResults = null;
    searchResultsDependency.changed();
    $("input.youtube-query").focus();
  },

  //add search result to Meteor collection
  'click .youtube-result, click a.loved': function(e, template) {

    var videoId = (this.id !== undefined) ? this.id : this._id;

    //see if search bar is linked up to a collection
    if (!template.collection) { console.warn("no collection defined"); return; }
    if (!template.playlistId) { console.warn("no collection id defined"); return; }

    console.log('queue video:', videoId, 'to playlist', template.playlistId);
    $("input.youtube-query").focus();
    var songObject = {
      "added" : new Date(),
      "author" : Meteor.userId(),
      "songId" : videoId
    };
    template.collection.update(
      { _id: template.playlistId},
      { $push: { songs: songObject} }
    );
  },

  //Loved a song!
  'click button#quickLove': function(e) {
    e.stopPropagation();
    console.log("add "+this.snippet.title+" to loved songs");
    var user = Meteor.users; //loved songs are stored in users profile
    user.update(
      { _id: Meteor.userId()	},
      { $addToSet : { 'profile.lovedSongs': this.id.videoId }}
    );
  },
  'click [data-action="show-list"]' : function() {
    Session.set("songView","list");
  },
  'click [data-action="show-grid"]' : function() {
    Session.set("songView","grid");
  }
};

// Youtube search results
var searchTimer;
var searchDelay = 250; // ms

function youtubeSearch(value) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    if (!value) {
      SsearchResults = null;
      searchError = 'Please search for something';
      searchResultsDependency.changed();
      return;
    }
    console.log('youtube search for:', value);
    youtubeSearchQuery({
      part: 'id,snippet',
      type: 'video',
      videoEmbeddable: 'true',
      q: value
    });
  },searchDelay);
}

var searchError;
var searchResults;
var searchResultsDependency = new Deps.Dependency();

youtubeSearchQuery = function(options) {
  options = options || {};
  var currentSearchTimer = searchTimer;

  Meteor.call('youtube_search', options, function(error, data) {
    if (error) {
      console.log('Youtube search API error:', error);
    } else {
      console.log('Youtube search API result:', data);
    }
    searchError   = error;
    searchResults = data; // TODO: search result data != videoQuery data
    searchResultsDependency.changed();

    if (currentSearchTimer != searchTimer) {
      console.warn('cancel video query');
      return;
    }

    // query for more details (needs optimization)
    var ids = _.pluck(_.pluck(data.items, 'id'), 'videoId');
    console.log('load more data for ', ids);

    youtubeVideoQuery({
      'part': 'snippet,contentDetails,statistics',
      'id': ids,
    });
  });
};

youtubeVideoQuery = function(options) {
  options = options || {};

  Meteor.call('youtube_videos_list', options, function(error, data) {
    if (error) {
      console.log('Youtube list API error:', error);
    } else {
      searchResults = data; // TODO: search result data != videoQuery data
      searchResultsDependency.changed();
    }
  });
};

Template.searchResults.result = function() {
  Deps.depend(searchResultsDependency);
  return searchResults;
};

Template.searchBar.error = function() {
  Deps.depend(searchResultsDependency);
  return searchError;
};
