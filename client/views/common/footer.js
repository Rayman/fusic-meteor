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
	var list = Session.get("playlist");
	youtubePlayer.loadVideoById(list[Session.get("playIndex")], 0, "large");
	youtubePlayer.pauseVideo(); //start paused
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

      var i = Session.get("playIndex"); //get index from session vars
      console.log("song "+i+" finished");
      var list = Session.get("playlist"); //fetch current playlist order
      if (i == list.length-1) { //just finished the last song
        youtubePlayer.stopVideo(); 
      }
	  i++;
      Session.set("playIndex",i); //update play Index

      youtubePlayer.loadVideoById(list[i], 0, "large"); //load and play next video
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