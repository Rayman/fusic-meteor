Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound',
  yieldTemplates: {
    'header': { to: 'header' },
    'footer': { to: 'footer' }
  }
});

// when data returns falsy, show the NotFound template
Router.plugin('dataNotFound', {notFoundTemplate: 'NotFound'});

// global configuration
Router.waitOn(function() {
  return [Meteor.subscribe('allplaylists'),
          Meteor.subscribe('allusers')];
});

// route specific configuration

Router.map(function() {
  this.route('home', {path: '/'});
  this.route('loading'); //<Testing purposes only
  this.route('notfound'); //<Testing purposes only

  this.route('playlists', {
    data: {
      playlists: function() {
        return Playlists.find({privacy:{$ne:'private'}},{sort: {createdAt: -1}, limit: 5});
      }
    }
  });

  this.route('allplaylists', {
    data: {
      playlists: function() {
        return Playlists.find({privacy:{$ne:'private'}},{sort: {createdAt: -1}});
      }
    }
  });

  this.route('playlist', {
    path: '/playlist/:_id',
    subscriptions: function() {
      this.subscribe('playlist', this.params._id).wait();
    },
    loadingTemplate: 'playlist',
    data: function() {
      //return all current client side playlists (just one ;)
      return Playlists.findOne(this.params._id);
    },
  });

  this.route('loved', {
    subscriptions: function() {
      var user = Meteor.user();
      if (!user)
        return;
      var songs = user.profile.lovedSongs;
      this.subscribe('songs', songs);
    },
    data: {
      lovedSongs: function() {
        var user = Meteor.user();
        //find song info in the cache for each song
        return Songs.find({_id: {$in: user.profile.lovedSongs} });
      }
    }
  });

  this.route('userProfile', {
    path:'/profile/:_id',
    waitOn: function() {
      return Meteor.subscribe('playlistsByUser', this.params._id);
    },
    data: function () {
      var user = Meteor.users.findOne(this.params._id);
      if (!user)
        return;

      var playlists = Playlists.find( {owner: this.params._id});
      user.userPlaylists = playlists;
      return user;
    },
  });
});
