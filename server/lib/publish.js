Meteor.publish("allplaylists", function () {
  return Playlists.find();
});

Meteor.publish("playlist", function (id) {
  return Playlists.find({_id: id});
});

Meteor.publish("songs", function (ids) {
  check(ids, [String]);
  return Songs.find({_id: {$in: ids}});
});