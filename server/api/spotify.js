/**
 * Spotify API functions here!
 * You'll need to have an oauth token to call each of these methods
 */

 var OAuth = Package.oauth.OAuth;

Meteor.methods({
  // Get current user's saved tracks from the spotify api
  // https://developer.spotify.com/web-api/console/get-current-user-saved-tracks/
  spotifyGetSavedTracks: function(key) {
    check(key, String);
    var apiUrl = "https://api.spotify.com/v1/me/tracks";

    //get accesToken from pending credential
    var cred = OAuth._pendingCredentials.findOne({key: key});
    var token = cred.credential.serviceData.accessToken;
    //clean up pending credential
    OAuth._pendingCredentials.remove({ _id: cred._id });

    var result;
    try {
      result = HTTP.call("GET", apiUrl, {headers : {
          "Accept"        : "application/json",
          "Authorization" : "Bearer " + token
          },
          params: {limit: 50} 
      });
    } catch(e) {
      console.log(e.toString());
      return false;
    }

    return result.data;
  }
});
