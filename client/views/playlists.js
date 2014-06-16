Template.playlist.selected = function () {
  return Session.equals("playing_song", this._id) ? "selected" : '';
};

Template.playlist.events = {
  'click [data-toggle="collapse"]': function (e) {
    var parent = $('.edittoggle');
    var out = parent.find('.collapse.in');
    parent.find('.collapse:not(.in)').collapse('show');
    out.collapse('hide');
  }
};

Template.playlistEntry.isLoved = function() {
  var videoId = this._id;
  var user = Meteor.user();
  if (!user)
    return;
  var i = user.profile.lovedSongs.indexOf(videoId);
  if (i<0)
    return ""; //not loved
  else
    return "loved"; //return classname
};

Template.updatePlaylistForm.editingDoc = function () {
  return Playlists.findOne({_id: this._id});
};

// initialize active_tab
Session.set('active_tab', 'songs');

Template.playlistTabs.helpers({
  isActiveTab: function(route) {
    return Session.equals("active_tab", route) ? "active" : "";
  },
});

Template.playlistTabs.owner = function () {
  return Meteor.users.findOne({_id: this.owner});
};

Template.playlistTabs.events = {
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
  'click button[data-toggle="clearResults"]': function(e) {

	$("input.youtube-query").val("");
	searchResults = null;
    searchResultsDependency.changed();
  },
  'click .youtube-result': function (e, template) {
    var videoId = this.id.videoId;
    var playlistId = template.data._id;
    console.log('queue video:', videoId, 'to playlist', playlistId);
    Playlists.update(
      { _id: playlistId},
      { $push: { songs: videoId} }
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
  'click a[rel="external"]': function(e) {
    e.stopPropagation(); // prevent queueing
    e.preventDefault(); // prevent linking in current window
    window.open(e.currentTarget.href, '_blank');
  }
};

Template.songs.events = {
  'click [data-action="play"]' : function(e, template) {
    var row = $(e.currentTarget).parents('div.row');
    var index = $(e.delegateTarget).children('div.row').index(row);
    console.log('playing song at index', index);

    // update the user's profile and the song will automatically play
    var id = Meteor.userId();
    var playlistId = template.data._id;
    if (id) {
      Meteor.users.update({_id: id}, { $set: {
        'profile.playing': {
          'playlist': playlistId,
          'playlistIndex': index,
          'status': 'playing',
          'modified': new Date(),
        }
      }});
    } else {
      console.warn('user not logged in!!!');
    }
  },
  'click [data-action="remove"]' : function(e, template) {
    var row = $(e.currentTarget).parents('div.row');
    var index = $(e.delegateTarget).children('div.row').index(row);
    console.log('removing song at index', index);

    // removing a element at a position is impossible in mongodb,
    // so just set the shole array
    if (index >= 0) {
      var songs = _.clone(template.data.songs); // clone is important!!!
      songs.splice(index, 1); // remove 1 element at position index
      Playlists.update({_id: template.data._id}, { $set : {"songs": songs}});
    }
  },
  'click [data-action="lovesong"]' : function(e) {
    //TODO: should find a way to merge this one with #quicklove from search results..
    var videoId = this._id;
    var user = Meteor.user();

    //Toggle depending on current state
    if(user.profile.lovedSongs.indexOf(videoId) <0) { //not currently loved
      console.log("add "+videoId+" to loved songs");
      Meteor.users.update(
        { _id: Meteor.userId() },
        { $addToSet : { 'profile.lovedSongs': videoId }}
      );
    } else { //currently loved, remove it from lovedSongs
      console.log("remove "+videoId+" from loved songs");
      Meteor.users.update(
        { _id: Meteor.userId() },
        { $pull : { 'profile.lovedSongs': videoId }}
      );
    }
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

Template.songs.songs = function() {
  if (!this.songs)
    return;

  // get all users that play a song on this playlist
  var users = Meteor.users.find({'profile.playing.playlist': this._id});
  var indexes = _.groupBy(users.fetch(), function(u) {
    return u.profile.playing.playlistIndex;
  });

  // find all songs for this playlist

  // optimize this later with only 1 query
  // var songs = Songs.find({_id: {$in: ids}});

  var songs = this.songs.map(function (id, i) {
    var song = Songs.findOne({_id: id});
    if (!song) // not yet received by the pub/sub
      return;

    // all users on this song
    var songUsers = indexes[i];
    song.users = songUsers;

    //var i = users.profile.playing.playlistIndex;
    //console.log(i);
    return song;
  });

  return songs;
};
