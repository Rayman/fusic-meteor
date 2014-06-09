var Youtube = Meteor.require('youtube-api');
var YOUTUBE_ACCESS_TOKEN = 'AIzaSyAK-DHrYPbww17dc-dK_HhUwmLhFjMynj0';
var Future = Npm.require('fibers/future');

Youtube.authenticate({
  type: "key",
  key: YOUTUBE_ACCESS_TOKEN
});

function callYoutubeAPI(module, fn, options) {
    var future = new Future();

    Youtube[module][fn](options, function (err, data) {
      if (err) {
        console.log('Youtube error:', err);
        future.return(new Meteor.Error(500, 'Internal server error', err));
      } else {
        // Return the results
        future.return(data);
      }
    });

    // Wait for async to finish before returning the result
    var r = future.wait();
    if (r instanceof Meteor.Error) {
      throw r;
    } else {
      return r;
    }
}

//User Creation
Accounts.onCreateUser(function(options, user) {
  // accounts-password doesn't create a profile
  user.profile = options.profile ? options.profile : {};

  //empty array so that $addtoset can be used in mongo
  user.profile.lovedSongs = [];
  return user;
});

Meteor.methods({
  youtube_search: function(options) { 
    //first get id's, then fetch additional info using youtube_videos_list method
    return callYoutubeAPI("search", "list", options);
  },
  youtube_videos_list: function(options) {
    var result = callYoutubeAPI("videos", "list", options);

    // cache result
    for (var i=0; i<result.items.length; i++) {
      var item = result.items[i];

      assert.equal(item.kind, 'youtube#video');

      var doc = {
        _id      : ""+item.id, // convert to string to sanitize input
        modified : new Date(),
        etag     : item.etag
      };
      if (item.snippet) {
        console.log('updating cache for video:', item.id);
        doc.snippet        = item.snippet;
        doc.contentDetails = item.contentDetails;
        doc.statistics     = item.statistics;

        Songs.update(
          { _id: doc._id },
          doc,
          { upsert: true }
        );
      }
    }

    return result;
  },
});