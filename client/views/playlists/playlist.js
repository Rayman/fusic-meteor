Template.playlist.rendered = function() {
  AutoForm.hooks({
    updatePlaylistForm: { //on successful edit, collapse back out
      onSuccess: function(operation, result, template) {
        $('#playlistInfo').collapse('show');
        $('#updatePlaylistForm').collapse('hide');
      }
    }
  });
};

// Playlist remove callbacks
Template.ownerPanel.onSuccess = function () {
  return function (result) {
    console.warn('playlist removed!!!', result);
  };
};

Template.ownerPanel.onError = function () {
  return function (error) {
    console.warn('playlist not removed!!!', error);
  };
};

Template.ownerPanel.beforeRemove = function () {
  return function (collection, id) {
    var doc = collection.findOne(id);
    if (confirm('Really delete "' + doc.title + '"?')) {
      Router.go('playlists');
      this.remove();
    }
  };
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

Template.playlist.helpers({
  searchCallback: function (videoId) {
    // this function will get called from the searchBar template
    var playlistId = Template.parentData(1)._id;

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
  }
});

Template.updatePlaylistForm.editingDoc = function () {
  return Playlists.findOne({_id: this._id});
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
    setTimeout(function () {
      // removing a element at a position is impossible in mongodb,
      // so just set the shole array
      if (index >= 0) {
        var songs = _.clone(template.data.songs); // clone is important!!!
        songs.splice(index, 1); // remove 1 element at position index
        Playlists.update({_id: template.data._id}, { $set : {"songs": songs}});
      }
    }, 300);

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

Template.songs.songs = function() {
  if (!this.songs)
    return;

  // get all users that play a song on this playlist
  var playingUsers = Meteor.users.find({'profile.playing.playlist': this._id});
  var indexes = _.groupBy(playingUsers.fetch(), function(u) {
    return u.profile.playing.playlistIndex;
  });

  var lovedSongs = Meteor.user().profile.lovedSongs;

  // find all songs for this playlist
  var ids = _.pluck(this.songs, 'songId');
  var songDB = _.indexBy(
    Songs.find({ _id: {$in: ids} }).fetch(),
    '_id'
  );

  // find all users that have contributed to this playlist
  var authorIds = _.uniq(_.pluck(this.songs, 'author'));
  var authorDB = _.indexBy(
    Meteor.users.find({ _id: {$in: authorIds} }).fetch(),
    '_id'
  );

  var songs = this.songs.map(function (entry, i) {

    var song = songDB[entry.songId];
    if (!song) // not yet received by the pub/sub
      return;

    // all users on this song
    var songUsers = indexes[i];
    song.users = songUsers;

    //extra info
    song.author = authorDB[entry.author];
    song.addedFromNow = entry.added ? moment(entry.added).fromNow() : "";

    // check if this song is loved by the user
    song.isLoved = (_.contains(lovedSongs, entry.songId)) ? 'loved' : '';

    return song;
  });

  return songs;
};

Template.songs.rendered = function() {
  Session.setDefault("songView","list");
};
