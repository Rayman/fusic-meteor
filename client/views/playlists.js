Template.playlists.selected_name = function () {
  var player = Players.findOne(Session.get("selected_player"));
  return player && player.name;
};

Template.playlist.selected = function () {
  return Session.equals("playing_song", this._id) ? "selected" : '';
};

// initialize active_tab
Session.set('active_tab', 'songs');

Template.playlistTabs.helpers({
  isActiveTab: function(route) {
    return Session.equals("active_tab", route) ? "active" : "";
  }
});

Template.playlistTabs.events = {
  'click ul.playlist-tabs > li': function (event) {
    var li = $(event.currentTarget);
    var route = li.data('id');
    Session.set("active_tab", route);
  }
};