Meteor.publish("allusers", function () {
  return Meteor.users.find({},
                           {fields: {'username': 1, 'profile': 1}});
});

Meteor.publish("allplaylists", function () {
  return Playlists.find();
});

Meteor.publish("playlist", function (id) {
  return Playlists.find({_id: id});
});

Meteor.publish("songs", function (songs) {
  if(Match.test(songs,[Object])) { //this is the new style playlist object
    var ids = _.pluck(songs, 'songId');
    return Songs.find({_id: {$in: ids}});
   }

});