Meteor.publish("allusers", function () {
  return Meteor.users.find(
    {},
    { fields: {'username': 1, 'profile': 1, 'createdAt':1} }
  );
});

Meteor.publish("playlists/newest", function () {
  return Playlists.find(
    { 'privacy' : { $ne: 'private'} },
    { limit: 5 }
  );
});

//In all playlists view, hide the private ones
Meteor.publish("allplaylists", function () {
  return Playlists.find({'privacy' : { $ne: 'private'}});
});

Meteor.publishComposite('playlist', function(id) {
  return {
    find: function() {
      return Playlists.find({_id: id});
    },
    children: [
      {
        find: function(playlist) {
          var songIds = _.pluck(playlist.songs, 'songId');
          return Songs.find({_id: {$in: songIds}});
        }
      }
    ]
  };
});

//songs by id
Meteor.publish("songs", function (ids) {
  check(ids, [String]);
  return Songs.find({_id: {$in: ids}});
});

//Playlists from one user, including private ones
Meteor.publish("playlistsByUser", function(userId) {
  return  Playlists.find(
    {owner:userId},
    {
      sort: {createdAt: 1},
      fields: {
        'title': 1,
        'createdAt': 1,
        'songs': 1
      }
    }
  );
});
