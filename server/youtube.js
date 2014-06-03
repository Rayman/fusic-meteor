var Youtube = Meteor.require('youtube-api');
var YOUTUBE_ACCESS_TOKEN = 'AIzaSyAK-DHrYPbww17dc-dK_HhUwmLhFjMynj0';
var Future = Npm.require('fibers/future');

Youtube.authenticate({
  type: "key",
  key: YOUTUBE_ACCESS_TOKEN
});

Meteor.methods({
  youtube_search: function(options) {

    var future = new Future();

    Youtube.search.list(options, function (err, data) {
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
  },
});