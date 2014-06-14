// * * * * * * * * * * * * * * * PLAYER TEMPLATE CALLBACKS  * * * * * * * * * * * * * * 

Template.player.created = function() {
  Session.set('youtubePlayerInitialized', false);
};  

Template.player.rendered = function() {
  if (Session.equals('youtubePlayerInitialized', false)) {
    $.getScript('https://www.youtube.com/iframe_api', function () {});
  }
};

// * * * * * * * * * * * * * * * YOUTUBE IFRAME PLAYER INITIALIZATION  * * * * * * * * * * * * * * 

onYouTubeIframeAPIReady = function() {
  youtubePlayer = new YT.Player('youtube-embed', {
    height: '480',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  Session.set('youtubePlayerInitialized', true);
};

//  * * * * * * * * * * * * * * Callbacks  * * * * * * * * * * * * * * 

function onPlayerReady(event) {
  // the footer is not yet loaded
}
function onPlayerStateChange(event) {
  $("#player-song-title").text(event.target.getVideoData().title);

  $(".player-control-button").removeClass("active");

  console.log("Player State: "+event.data);

  switch (event.data) {
    case -1: //unstarted
      $("#player-stop").addClass("active");
      break;
    case 0: //ended
      $("#player-stop").addClass("active");

      var id = Meteor.userId();
      console.log('song ended');
      Meteor.users.update({_id: id},
        {$inc: {'profile.playing.playlistIndex': 1}}
      );
      break;
    case 1: //playing
      $("#player-play").addClass("active");
      break;
    case 2: //paused
      $("#player-pause").addClass("active");
      break;
    case 3: //buffering
      break;
    case 5: //video cued
      break;
  }
}

// observe changes in the user.playing object
var lastPlaylistIndex, lastPlaylistId;
Deps.autorun(function () {
  var userId = Meteor.userId();                                                             // 28
  if (!userId)                                                                              // 29
    return;

  var user = Meteor.users.findOne(userId);
  if (!user)
    return;

  var playing = user.profile.playing;
  if (playing.playlist == lastPlaylistId &&
      playing.playlistIndex == lastPlaylistIndex) {
    console.log('not playing: same song');
    return;
  }
  lastPlaylistIndex = playing.playlistIndex;
  lastPlaylistId    = playing.playlist;

  var playlist = Playlists.findOne({_id: playing.playlist});
  var videoId = playlist.songs[playing.playlistIndex];

  //load and play next video
  console.log('playing youtube video: ', videoId);
  youtubePlayer.loadVideoById(videoId, 0, "large");
});

// Sync player status with youtube player
var playerProgress = setInterval(function() {
  if(Session.equals('youtubePlayerInitialized', true)) {
    if (youtubePlayer.getCurrentTime) {
      var percentage = 100*(youtubePlayer.getCurrentTime()/youtubePlayer.getDuration());
      $("#player-progressbar").width(percentage + "%");
      $("#player-song-duration").text((youtubePlayer.getDuration()-youtubePlayer.getCurrentTime()).toString().toHHMMSS());
    }
  }
}, 500);

//  * * * * * * * * * * * * * * Player TEMPLATE Controls  * * * * * * * * * * * * * * 

Template.player.events = {
  'click a#player-play': function (e) {
    youtubePlayer.playVideo();
  },
  'click a#player-pause': function (e) {
    youtubePlayer.pauseVideo();
  },
  'click a#player-stop': function (e) {
    youtubePlayer.stopVideo();
  },
  'click #player-progressbar-container-overlay': function (e) {
    var fraction = e.offsetX / $(e.target).width();
    youtubePlayer.seekTo( youtubePlayer.getDuration() * fraction );
  },
};

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

Template.currentPlaylist.currentPlaylist = function () {
  var playing = getUserPlaying();
  if (!playing) {
    return;
  }

  var playlist = Playlists.findOne({_id: playing.playlist});
  var ret = {
    playlist: playlist,
    playlistId: playing.playlist,
    index: playing.playlistIndex,
    modified: playing.modified,
    status: playing.status,
  };
  //console.log(ret);
  return ret;
};

Template.queueSong.song = function() {
  return Songs.findOne({_id: ""+this});
};

Template.queueSong.isCurrent = function (playlist, index) {
  return playlist.songs[index] == ""+this;
};

function getUserPlaying() {
  var user = Meteor.user();
  if (!user) {
    console.warn('user is not logged on!!!');
    return;
  }

  var profile = user.profile;

  if (!profile.playing) {
    console.warn('not yet playing any song!!!');
    return;
  }

  return profile.playing;
}