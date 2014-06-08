// * * * * * * * * * * * * * * * YOUTUBE IFRAME PLAYER INITIALIZATION  * * * * * * * * * * * * * * 

// 1. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. This function creates an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-embed', {
    height: '480',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

Template.player.rendered = function() {
  console.log('Youtube player container is rendered');
  // THIS IS NEEDED SINCE THE ONYOUTUBEIFRAMEAPIREADY IS NOT CALLED AUTOMATICALLY BY METEOR
  setTimeout(onYouTubeIframeAPIReady, 900);

  var progress = setInterval(function() {
    if (youtubePlayer && youtubePlayer.getPlayerState && youtubePlayer.getPlayerState() == 1) {
      var percentage = 100*(youtubePlayer.current/youtubePlayer.duration);
      $("#player-progressbar").width(percentage + "%");
      youtubePlayer.current+=1;
    }
  }, 1000);
}

//  * * * * * * * * * * * * * * Callbacks  * * * * * * * * * * * * * * 

function onPlayerReady(event) {
  console.log('Youtube Player Ready');
}

function onPlayerStateChange(event) {
  youtubePlayer.duration = event.target.getDuration();
  youtubePlayer.current = event.target.getCurrentTime();
  $("#player-progressbar p").text(event.target.getVideoData().title);
}

//  * * * * * * * * * * * * * * Player Controls  * * * * * * * * * * * * * * 

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
};