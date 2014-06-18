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
var lastPlaylistIndex, lastPlaylistId, lastVideoId;
Deps.autorun(function () {

  var user = Meteor.user();
  if (!user || !user.profile)
    return;

  var playing = user.profile.playing;
  if (!playing)
    return;

  // start the youtube video on pause,
  // on page load, both are undefined
  /*
  var startPaused = (!lastPlaylistIndex || !lastPlaylistId);
  if (startPaused) {
    console.log('starting paused');
    youtubePlayer.pauseVideo();
    return;
  }
  */

  var playlist = Playlists.findOne({_id: playing.playlist});
  if (!playlist)
    return;

  var videoId = playlist.songs[playing.playlistIndex];
  if (!videoId)
    return;

  if (lastVideoId       == videoId /* &&
      lastPlaylistId    == playing.playlist &&
      lastPlaylistIndex == playing.playlistIndex */
  ) {
    console.log('not playing: same song');
    return;
  }
  lastVideoId       = videoId;
  lastPlaylistIndex = playing.playlistIndex;
  lastPlaylistId    = playing.playlist;

  if (typeof youtubePlayer == 'undefined') {
    console.warn('youtubePlayer undefined');
    return;
  }

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
  var user = Meteor.user();
  if (!user) {
    return;
  }

  var profile = user.profile;
  if (!profile.playing) {
    console.warn('not yet playing any song!!!');
    return;
  }

  var playing = profile.playing;
  if (!playing) {
    return;
  }

  var playlist = Playlists.findOne({_id: playing.playlist});
  return {
    playlist: playlist,
    playlistId: playing.playlist,
    index: playing.playlistIndex,
    modified: playing.modified,
    status: playing.status,
  };
};

Template.queueSong.song = function() {
  return Songs.findOne({_id: ""+this});
};

Template.queueSong.isCurrent = function (playlist, index) {
  return playlist.songs[index] == ""+this;
};