Meteor.publish("playlists", function () {
  return Playlists.find();
});

Meteor.publish("songs", function (ids) {
  check(ids, [String]);
  return Songs.find({_id: {$in: ids}});
});