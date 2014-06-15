// global configuration

Router.waitOn(function() {
  return Meteor.subscribe('playlists');
});

// route specific configuration

Router.map(function() {
  this.route('home', {path: '/'});

  this.route('playlists', {
    data: {
      playlists: function() {
        return Playlists.find({},{sort: {createdAt: -1}, limit: 5});
      }
    },
  });

  this.route('playlist', {
    path: '/playlist/:_id',
    waitOn: function() {
      var playlist = Playlists.findOne({_id: this.params._id});
      if (!playlist)
        return;
      var songs = playlist.songs || [];
      console.log('subscribe to ', songs);
      return Meteor.subscribe('songs', songs);
    },
    notFoundTemplate: 'playlistNotFound',
    data: function() {
      return Playlists.findOne(this.params._id);
    },
  });

  this.route('loved', {
    data: {
		lovedSongs: function() {
			//get current user
			var user = Meteor.users.findOne({_id: Meteor.userId()});
			//find song info in the cache for each song
			return Songs.find({_id:{$in:user.profile.lovedSongs}});
		}
    }
  });
  
  this.route('friends');
});