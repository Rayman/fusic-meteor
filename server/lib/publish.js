Meteor.publish("playlists", function () {
  return Playlists.find();
});

Meteor.publish("songs", function (ids) {
  console.log('publishing songs:', ids);
  check(ids, [String]);

  return Songs.find({_id: {$in: ids}});
});