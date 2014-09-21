// * * * * * * * * * * * * * * * PLAYER TEMPLATE CALLBACKS  * * * * * * * * * * * * * *

Template.player.rendered = function() {

  if (Session.equals('youtubePlayerInitialized', false)) {
    $.getScript('https://www.youtube.com/iframe_api', function () {});
  }
  if ($('div#youtube-embed').length == 1  &&
      typeof YT != 'undefined' && YT.loaded==1) { //if placeholder is (still) in place and YT api is available, re-init player
    initPlayer();
  }


  var isDragging = false;


  var setVolume = function(volume) {
    var vol = (volume/100) *  $("div.track").width();
    $("div.bar").width(vol);
    $("div.thumb").css("left",vol-($("div.thumb").width()/2)+"px");
    if(youtubePlayer && youtubePlayer.setVolume) {
      youtubePlayer.setVolume(volume);
    }
  };

  var defaultVolume = 75;
  setVolume(defaultVolume);


  $("div.thumb").mousedown(function() {
      $(window).mousemove(function(e) {
          isDragging = true;
            var parentOffset = $("div.track").offset();
            var relX = e.pageX - parentOffset.left;
            var trackWidth = $("div.track").width();
            var volume = (relX /trackWidth )*100;
            if (volume >= 100) {  volume=100; }
            if (volume <= 0) { volume=0; }
            setVolume(volume);

          //$(window).unbind("mousemove");
      });
  });
  $(window).mouseup(function() {
      var wasDragging = isDragging;
      isDragging = false;
      $(window).unbind("mousemove");
  });
}

// * * * * * * * * * * * * * * * YOUTUBE IFRAME PLAYER INITIALIZATION  * * * * * * * * * * * * * *

Session.set('youtubePlayerInitialized', false);
youtubePlayer=null;
initPlayer = function() {
  youtubePlayer = new YT.Player('youtube-embed', {
    height: '480',
    width: '640',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  Session.set('youtubePlayerInitialized', true);
}
onYouTubeIframeAPIReady = initPlayer;


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
      Session.set("playerState","stopped");
      break;
    case 0: //ended
      $("#player-stop").addClass("active");
      Session.set("playerState","stopped");
      var id = Meteor.userId();
      console.log('song ended');
      Meteor.users.update({_id: id},
        {$inc: {'profile.playing.playlistIndex': 1}}
      );
      break;
    case 1: //playing
      $("#player-play").addClass("active");
      Session.set("playerState","playing");
      break;
    case 2: //paused
      $("#player-pause").addClass("active");
      Session.set("playerState","paused");
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
  if (!playing || playing.status == 'pause')
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

  Session.set("playlistIndex",playing.playlistIndex);
  Session.set("playlist",playlist);

  if (!playlist.songs[playing.playlistIndex])
    return;
  var videoId = playlist.songs[playing.playlistIndex].songId;
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
  if (youtubePlayer) {
	youtubePlayer.loadVideoById(videoId, 0, "large");
  }
});

// Sync player status with youtube player
var playerProgress = setInterval(function() {
  if(!youtubePlayer) {return;}
  if(Session.equals('youtubePlayerInitialized', true)) {
    if (youtubePlayer.getCurrentTime) {
      var percentage = 100*(youtubePlayer.getCurrentTime()/youtubePlayer.getDuration());
      $("#player-progressbar").width(percentage + "%");
      $("#player-song-duration").text((youtubePlayer.getDuration()-youtubePlayer.getCurrentTime()).toString().toHHMMSS());
    }
  }
}, 500);


var checkInterval = 2; // seconds
var currentUrl;
var playingDuration = 0; // seconds
var playReported = false;
setInterval(function() {
  if(!youtubePlayer || !youtubePlayer.getPlayerState)
    return;

  if (youtubePlayer.getVideoUrl() != currentUrl) {
    // new song
    currentUrl = youtubePlayer.getVideoUrl();
    playReported = false;
    playingDuration = 0;
  } else {
    if (youtubePlayer.getPlayerState() == 1) { // playing
      playingDuration += checkInterval;

      if (playReported)
        return;
      if (playingDuration > 240 || playingDuration/youtubePlayer.getDuration() > 0.5) {
        playReported = true;

        var user = Meteor.user();
        if (user &&
            user.profile &&
            user.profile.playing &&
            user.profile.playing.playlist) {
          var playlist = Playlists.findOne({_id: user.profile.playing.playlist});
          if (!playlist)
            return;

          var songId = playlist.songs[user.profile.playing.playlistIndex].songId;

          console.log('this sound has been played enough to count for a play');
          PlayCounts.insert({songId: songId});
        }
      }
    }
  }
}, checkInterval * 1000);

//  * * * * * * * * * * * * * * Player TEMPLATE Controls  * * * * * * * * * * * * * *

Template.player.events = {
  'click #player-play': function (e) {
    youtubePlayer.playVideo();
  },
  'click #player-pause': function (e) {
    youtubePlayer.pauseVideo();
  },
  'click #player-stop': function (e) {
    youtubePlayer.stopVideo();
  },
  'click #player-progressbar-container': function (e) {
    var fraction = e.offsetX / $(e.target).width();
    youtubePlayer.seekTo( youtubePlayer.getDuration() * fraction );
  },
  'click #player-next': function(e) {
      console.log('next song');
      var list = Session.get("playlist");
      if(Session.get("playlistIndex") < list.songs.length-1) {

        var id = Meteor.userId();
        Meteor.users.update({_id: id},
          {$inc: {'profile.playing.playlistIndex': 1}}
        );
      }
  },
  'click #player-previous': function(e) {
      console.log('previous song');
      if (Session.get("playlistIndex")>0) {
        var id = Meteor.userId();
        Meteor.users.update({_id: id},
          {$inc: {'profile.playing.playlistIndex': -1}}
        );
      }
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

// always subscribe to the current playing playlist
Deps.autorun(function () {
  var user = Meteor.user();

  if (user &&
      user.profile &&
      user.profile.playing &&
      user.profile.playing.playlist) {
    Meteor.subscribe('playlist', user.profile.playing.playlist);

    // subscribe to songs
    var playlist = Playlists.findOne({_id: user.profile.playing.playlist});
    if (playlist) {
      var songs = playlist.songs;
      songs = _.pluck(songs, 'songId');
      check(songs, [String]);
      Meteor.subscribe('songs', songs);
    }
  }
});

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
  var id = this.songId;
  return Songs.findOne({_id: id});
};

Template.queueSong.isCurrent = function (playlist, index) {
  if (!playlist.songs[index])
    return;
  return playlist.songs[index].songId == ""+this.songId;
};
