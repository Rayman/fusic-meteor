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
        console.log('Youtube error:', err, data);
      }
      // Return the results
      future.return(arguments);
    });

    // Wait for async to finish before returning the result
    return future.wait();
  },
});