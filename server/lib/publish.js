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

//songs by id
Meteor.publish("songs", function (ids) {
  check(ids, [String]);
  return Songs.find({_id: {$in: ids}});
});

//users by id, always include elaborate information from current user
//since it currently isn't possible to have two cursors from same collection
Meteor.publish("users", function (ids) {
  var ids = ids || [];
  if(this.userId) {
    ids.push(this.userId);
  }
  var users = Meteor.users.find({_id: {$in: ids}},
                    {fields: {'_id':1,
                              'createdAt':1,
                              'username': 1, 
                              'profile': 1, 
                    }});
  return users;
});


//more elaborate data per user id
Meteor.publish("userData", function (id) {
  check(id,String); 
  return Meteor.users.findOne({_id: id},
                              {fields: {'_id':1,
                                        'username': 1, 
                                        'profile.avatar': 1, 
                                        'createdAt':1,
                                        'emails':1
                              }});
  //dont return as cursor,  need the cursor for something else                           
});

//Playlists from one user
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