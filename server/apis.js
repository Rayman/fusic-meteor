//All echonest related methods.
//Currently, suggestions.js contains a method than can "convert" an artist + title to a youtube video
//and consequently add this to a fusic playlist.

var ECHONEST_KEY = 'Z9TLXHBRUB49YXCNR';

Meteor.methods({
  getArtistInfo:  function(artist) {
    artist = encodeURIComponent(artist);
    var url = "http://developer.echonest.com/api/v4/artist/profile?api_key="+ECHONEST_KEY+"&name="+artist+"&bucket=hotttnesss&bucket=terms&bucket=images&bucket=songs";
    var result;
    try {
      result = HTTP.get(url);
    } catch(e) {
      console.log(e.toString());
      return false;
    }
    return result.data.response;
  },

  hotRightNow: function(genre) {
    //default genre
    genre = typeof genre !== 'undefined' ? genre : 'alternative rock';
    var url = "http://developer.echonest.com/api/v4/playlist/static?api_key="+ECHONEST_KEY+"&type=genre-radio&genre="+genre+"&results=10&bucket=song_hotttnesss";
    var result;
    try {
      result = HTTP.get(url);
    } catch(e) {
      console.log(e.toString());
      return false;
    }
    if (result.data.response.songs) {
      result.data.response.songs.forEach(function(song) {

      });
      return result.data.response.songs;
    } else {
      return false;
    }
  },

//Hypem related methods
//Should return data more or less in the same way as the echnonest does, so these
//two methods can be exchanged
  hypemPopular: function() {
    var url = "http://hypem.com/playlist/popular/3day/json/1/data.js";
    var result;
    try {
      result = HTTP.get(url);
    } catch(e) {
      console.log(e.toString());
      return false;
    }
    if (result.data) {
      var nrs = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
      var songs = nrs.map(function(nr) {
        var song = result.data[nr];
        return { artist_name:song.artist,
                 title:song.title
                };
      });
      return songs;
    } else {
      return false;
    }

  }

});
