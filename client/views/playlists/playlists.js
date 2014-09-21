Template.insertPlaylistForm.rendered = function() {
  Session.setDefault('playlistPrivacy','public');
  this.find('[data-schema-key=privacy]').value = 'public';
  $("button").tooltip();
  AutoForm.hooks({
    insertPlaylistForm: {
      onSuccess: function(operation, result, template) {
        Router.go('/playlist/'+result);
      }
    }
  });
};

Template.insertPlaylistForm.events = {
  'click #privacyToggle button' : function(e,template) {
    var btn = e.currentTarget;
    Session.set('playlistPrivacy',btn.getAttribute("data-action"));
    template.find('[data-schema-key=privacy]').value = btn.getAttribute("data-action");
  }
};

Template.playlist.rendered = function() {
  AutoForm.hooks({
    removeButton: { //on successful remove, go back to playlist page
      onSuccess: function(operation, result, template) {
        Router.go('playlists');
      }
    },
    updatePlaylistForm: { //on successful edit, collapse back out
      onSuccess: function(operation, result, template) {
        $('#playlistInfo').collapse('show');
        $('#updatePlaylistForm').collapse('hide');
      }
    }
  });
};

Template.playlist.selected = function () {
  return Session.equals("playing_song", this._id) ? "selected" : '';
};

Template.playlist.playing = function () {
  // get all users that play a song on this playlist
  var user = Meteor.user();
  if (!user)
    return;
  if (user.profile &&
      user.profile.playing &&
      user.profile.playing.status   == 'playing' &&
      user.profile.playing.playlist == this._id
  ) {
    return true;
  } else {
    return false;
  }
};

Template.playlist.songCount = function() {
  return this.songs ? this.songs.length : 0;
};

Template.playlist.totalDuration = function() {
  var songIds = _.pluck(this.songs, 'songId');
  var songs = Songs.find({_id: {$in: songIds || []}});

  var durations = songs.map(function(song){
    var duration = song.contentDetails.duration;
    return moment.duration(duration);
  });

  var sum = _.reduce(durations, function(memo, duration){
    return memo.add(duration);
  }, moment.duration());

	return sum.humanize();
};

Template.playlist.following = function () {
  // get all users that play a song on this playlist
  var user = Meteor.user();
  if (!user)
    return;
  if (user.profile &&
      user.profile.following &&
      user.profile.following.indexOf(this._id) != -1
  ) {
    return true;
  } else {
    return false;
  }
};

Template.playlist.followers = function () {
  var users = Meteor.users.find({
    'profile.following': this._id
  });
  return users;
};

Template.playlist.players = function () {
  var users = Meteor.users.find({
    'profile.playing.playlist': this._id,
  });
  return users;
};

//This should probably not run on the client
Template.playlist.isOwner = function() {
	return this.owner == Meteor.userId();
};

Template.playlist.owner = function () {
  return Meteor.users.findOne({_id: this.owner});
};

Template.contributionChart.rendered = function () {
  if (!this.data)
    return;

  var width = 300,
      height = 200,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.amount; });

  var svg = d3.select(this.find('svg'))
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var groups = _.groupBy(this.data.songs, 'author');
  var users = _.map(groups, function (songs, author) {
    var user = Meteor.users.findOne({_id: author});
    user = user ? user.username : "";
    return {
      name: user,
      amount: songs.length,
    };
  });

  var g = svg.selectAll(".arc")
      .data(pie(users))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.name; });
};

Template.playlist.events = {
  'click [data-toggle="collapse"]': function (e) {
    var parent = $('.edittoggle');
    var out = parent.find('.collapse.in');
    parent.find('.collapse:not(.in)').collapse('show');
    out.collapse('hide');
  },
  'click [data-action="playlist-play"]': function () {
    var userid = Meteor.userId();
    if (!userid)
      return;
    Meteor.users.update(
      {_id: userid},
      { $set: {
          'profile.playing': {
            'playlist': this._id,
            'playlistIndex': 0,
            'status': 'playing',
            'modified': new Date(),
          }
        }
      }
    );
    youtubePlayer.playVideo();
  },
  'click [data-action="playlist-pause"]': function () {
    var userid = Meteor.userId();
    if (!userid)
      return;
    Meteor.users.update(
      {_id: userid},
      { $set: {
          'profile.playing.status'  : 'pause',
          'profile.playing.modified': new Date(),
        }
      }
    );
    youtubePlayer.pauseVideo();
  },
  'click [data-action="follow"]': function () {
    // addToSet
    var userid = Meteor.userId();
    if (!userid)
      return;
    Meteor.users.update(
      {_id: userid},
      { $addToSet: {
          'profile.following'  : this._id,
        }
      }
    );
  },
  'click [data-action="unfollow"]': function () {
    // addToSet
    var userid = Meteor.userId();
    if (!userid)
      return;
    Meteor.users.update(
      {_id: userid},
      { $pullAll: {
          'profile.following'  : [this._id],
        }
      }
    );
  },
};

Template.loveSong.isLoved = function() {
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

Template.ownerPanel.editingDoc = function () {
  return Playlists.findOne({_id: this._id});
};

// initialize active_tab
Session.set('active_tab', 'songs');

Template.playlistTabs.helpers({
  isActiveTab: function(route) {
    return Session.equals("active_tab", route) ? "active" : "";
  },
});

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
  },
  'click .youtube-result': function (e, template) {
    var videoId = this.id;
    var playlistId = template.data._id;
    console.log('queue video:', videoId, 'to playlist', playlistId);
    var songObject = {
      "added" : new Date(),
      "author" : Meteor.userId(),
      "songId" : videoId
    };
    Playlists.update(
      { _id: playlistId},
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

Template.songs.events = {

  'click [data-action="play"]' : function(e, template) {
    var row = $(e.currentTarget).parents('div.song');
    var index = $(e.delegateTarget).children('div.song').index(row);
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
    var row = $(e.currentTarget).parents('div.song');
    var index = $(e.delegateTarget).children('div.song').index(row);
    console.log('removing song at index', index);

	var songrow = $(row[0]);
	//set styles
	songrow.css("box-shadow","0px 0px 15px rgba(155, 155, 155, 0.55)");
	songrow.css("left","125%");

	//animation takes 300 seconds
	setTimeout(function(){
		// removing a element at a position is impossible in mongodb,
		// so just set the shole array
		if (index >= 0) {
      var songs = _.clone(template.data.songs); // clone is important!!!
      songs.splice(index, 1); // remove 1 element at position index
      Playlists.update({_id: template.data._id}, { $set : {"songs": songs}});
		}
	},300);


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
  var ids = _.pluck(this.songs, 'songId');
  var songDB = _.indexBy(Songs.find({_id: {$in: ids}}).fetch(), '_id');

  var songs = this.songs.map(function (entry, i) {

    var song = songDB[entry.songId];
    if (!song) // not yet received by the pub/sub
      return;

    // all users on this song
    var songUsers = indexes[i];
    song.users = songUsers;

    //extra info
    song.author = Meteor.users.findOne({_id: entry.author});
    song.added = entry.added;

    return song;
  });

  return songs;
};
Template.songs.rendered = function() {
	Session.setDefault("songView","list");
};
