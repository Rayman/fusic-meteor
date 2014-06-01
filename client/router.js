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
  this.route('playlists');
  this.route('loved');
  this.route('friends');

  this.route('playlist', { 
    path: '/playlist/:_id',
    data: function() {
      return Playlists.findOne(this.params._id);
    }
  });
});