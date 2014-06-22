Template.home.events = {
  'click button#quickAdd': function (e) {
	var playlistTitle = $("#playlistName").val();
    var newList = Playlists.insert({title:playlistTitle}, function(error,id) {
		//callback, if succeeded, go to new playlist
		if(id) {
			Router.go('/playlist/'+id);
		}
	});
  }

 };
