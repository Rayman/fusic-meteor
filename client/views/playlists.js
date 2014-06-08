Template.playlist.selected = function () {
  return Session.equals("playing_song", this._id) ? "selected" : '';
};

// initialize active_tab
Session.set('active_tab', 'songs');

Template.playlistTabs.helpers({
  isActiveTab: function(route) {
    return Session.equals("active_tab", route) ? "active" : "";
  }
 });

//Query to fetch songs from a specific playlist
Template.playlistTabs.songs = function() {
	return Songs.find({playlist: Router.current().params['_id']});
};

//Format youtube duration to normal duration
Template.searchResult.helpers({
  calcTime: function(oldTime) {
	//Format PT15M51S --> 15 minutes 51 seconds
  var time = oldTime || "";
	return time.replace("PT","").replace("H",":").replace("M",":").replace("S","");
  }
});

Template.playlistTabs.events = {
  'click ul.playlist-tabs > li': function (e) {
    var li = $(e.currentTarget);
    var route = li.data('id');
    Session.set("active_tab", route);
  },
  'click [data-action="remove"]' : function(e) {
    Songs.remove(this._id);
  },
  'submit form.youtube-search': function (e) {
    e.preventDefault();
  },
  'input input.youtube-query': function (e) {
    var input = $(e.currentTarget);
    youtubeSearch(input.val());
  },
  'click .youtube-result': function (e) {
    var el = $(e.currentTarget);
    var videoId = el.data('id');
    console.log('queue video:', videoId);

	//DUMMY functionality, we should think about how to really store a song in a collection..
	var title = el.find("h4").text();
	var duration = el.find(".duration-container").text();

	Songs.insert({videoId: videoId,
					name:title,
					duration:duration,
					playlist: Router.current().params['_id'] });

    youtubePlayer.loadVideoById(videoId, 0, "large");
  },
  'click a[rel="external"]': function(e) {
    e.stopPropagation(); // prevent queueing
    e.preventDefault(); // prevent linking in current window
    window.open(e.currentTarget.href, '_blank');
  }
};

// Youtube search results

var searchTimer;
var searchDelay = 250; // ms

function youtubeSearch(value) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function() {
    if (!value) {
      searchResults = null;
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

var searchResults;
var searchError;
var searchResultsDependency = new Deps.Dependency();

youtubeSearchQuery = function(options) {
  options = options || {};

  Meteor.call('youtube_search', options, function(error, data) {
    if (error) {
      console.log('Youtube API error:', error);
    } else {
      console.log('Youtube API result:', data);
    }
    searchError   = error;
    searchResults = data;
    searchResultsDependency.changed();

    // query for more details (needs optimization)
    var ids = _.pluck(_.pluck(data.items, 'id'), 'videoId');
    console.log('load more data for ', ids);

    youtubeVideoQuery({
      'part': 'snippet,contentDetails,statistics',
      'id': ids,
    })
  });
};

youtubeVideoQuery = function(options) {
  options = options || {};

  Meteor.call('youtube_videos_list', options, function(error, data) {
    if (error) {
      console.log('Youtube API error:', error);
    } else {
      console.log('Youtube API result:', data);
    }
  });
};

Template.searchResults.result = function() {
  Deps.depend(searchResultsDependency);
  return searchResults;
};

Template.searchResults.error = function() {
  Deps.depend(searchResultsDependency);
  return searchError;
};

Template.searchResult.song = function() {
  return Songs.findOne({_id: this.id.videoId});
}