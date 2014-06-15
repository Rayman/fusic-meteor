Meteor.publish("playlists", function () {
  return Playlists.find();
});

Meteor.publish("songs", function () {
  return Songs.find();
});