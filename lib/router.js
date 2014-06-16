// global configuration

Router.waitOn(function() {
  return Meteor.subscribe('allplaylists');
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
      return Meteor.subscribe('playlist',this.params._id);
    },
    onBeforeAction: function() {
      var playlist = this.data();
      if (!playlist)
        return;
      var songs = playlist.songs || [];
      //add another subscription to waiting list
      this.subscribe('songs', songs).wait();
    },
    loadingTemplate: 'playlist',
    notFoundTemplate: 'playlistNotFound',
    data: function() {
		//return all current client side playlists (just one ;)
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