Template.top.rendered = function() {
  Meteor.call("getTopSongs", function(err, result) {
      Session.set("topSongs", result);
  });
};

Template.top.helpers( {
  topSongs: function() {
    return Session.get("topSongs");
  }
});
