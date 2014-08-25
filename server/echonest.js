//All echonest related methods.
//Currently, suggestions.js contains a method than can "convert" an artist + title to a youtube video
//and consequently add this to a fusic playlist.

var ECHONEST_KEY = 'Z9TLXHBRUB49YXCNR';

Meteor.methods({
  getArtistInfo:  function(artist) {
    var artist = encodeURIComponent(artist);
    var url = "http://developer.echonest.com/api/v4/artist/profile?api_key="+ECHONEST_KEY+"&name="+artist+"&bucket=hotttnesss&bucket=terms&bucket=images&bucket=songs"
    
    try {
      var result = HTTP.get(url);
    } catch(e) {
      console.log(e.toString());
      return false;
    }
    return result.data.response;
  },
  
  hotRightNow: function(genre) {
    //default genre
    genre = typeof genre !== 'undefined' ? genre : 'current';
    var url = "http://developer.echonest.com/api/v4/playlist/static?api_key="+ECHONEST_KEY+"&type=genre-radio&genre="+genre+"&results=10&bucket=song_hotttnesss";
    try {
      var result = HTTP.get(url);
    } catch(e) {
      console.log(e.toString());
      return false;
    }
    if (result.data.response.songs) {
      result.data.response.songs.forEach(function(song) {
      
      });
      return result.data.response.songs;
    } else {
      //console.log(result.content);
      return false;
    }
  }
});