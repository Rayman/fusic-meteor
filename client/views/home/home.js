Template.home.events = {
  'click button#quickAdd': function (e) {
    e.preventDefault(); // no form submit

    var playlistTitle = $("#playlistName").val();
    Playlists.insert({title:playlistTitle}, function (error, id) {
      //callback, if succeeded, go to new playlist
      if(id)
        Router.go('/playlist/'+id);
    });
  }
};
