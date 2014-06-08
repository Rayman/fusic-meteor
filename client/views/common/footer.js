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
}

function onPlayerStateChange(event) {
  $("#player-song-title").text(event.target.getVideoData().title);
}

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
  'click #player-progressbar-container': function (e) {
    var fraction = e.offsetX / $(e.target).width();
    var time = youtubePlayer.getDuration()*fraction;
    youtubePlayer.seekTo(time);
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