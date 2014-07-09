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

Meteor.publish("songs", function (ids) {
  check(ids, [String]);
  return Songs.find({_id: {$in: ids}});
});

Meteor.publish("userData", function (id) {
  check(id,String); 
  return Meteor.users.find({_id: id},
                              {fields: {'_id':1,
                                        'username': 1, 
                                        'profile': 1, 
                                        'createdAt':1,
                                        'emails':1
                              }});                           
});

Meteor.publish("playlistsByUser", function(userId) {
    return  Playlists.find({owner:userId},
              { sort: {createdAt: 1},
                fields: { 'title':1,
                          'createdAt':1,
                          'songs':1
                }
              } 
            );
});