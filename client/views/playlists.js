Template.playlists.selected_name = function () {
  var player = Players.findOne(Session.get("selected_player"));
  return player && player.name;
};

Template.playlist.selected = function () {
  return Session.equals("playing_song", this._id) ? "selected" : '';
};