var BaseController = RouteController.extend({
});

var LoggedInController = BaseController.extend({
  onBeforeAction: function() {
    console.log('user filter?');
  }
});

Router.map(function() {
  this.route('home', {path: '/'});
  this.route('overview');

  this.route('playlists', {
    data: {
      playlists: function() {
        return Playlists.find({},{sort: {createdAt: -1}, limit: 5});
      }
    }
  });
  this.route('playlist', {
    path: '/playlist/:_id',
    notFoundTemplate: 'playlistNotFound',
    data: function() {
      return Playlists.findOne(this.params._id);
    }
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