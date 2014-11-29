//Initialisation of searchbar component,
// template example:
// {{> searchBar viewToggle=true callback="searchCallback" }}
/*--------------------------
  Available parameters
  callback    (string)      The name of the helper of the parent template that
                            will be called when a song has been selected
  viewToggle  (boolean)     show/hide the toggle view buttons (default: show)
  lovedToggle (boolean)     show/hide the add songs from loved songs button (default: show)
---------------------------*/

Template.searchBar.created = function( template ) {
  var d = this.data;
  this.lovedToggle = (typeof d.lovedToggle !== "undefined") ? d.lovedToggle : 1;
  this.viewToggle  = (typeof d.viewToggle !== "undefined") ? d.viewToggle : 1;

  this.lovedToggleWidth = (this.lovedToggle === 1) ? 1 : 0;
  this.viewToggleWidth  = (this.viewToggle === 1) ? 2 : 0;
  this.searchBarWidth = 12 - this.lovedToggleWidth - this.viewToggleWidth;
};

Template.searchBar.helpers({
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
    $("input.youtube-query").focus();

    var videoId = (this.id !== undefined) ? this.id : this._id;

    // callback here
    var callbackName = template.data.callback;
    var cb = template.view.parentView.parentView.template.__helpers.get(callbackName);
    cb(videoId);
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
