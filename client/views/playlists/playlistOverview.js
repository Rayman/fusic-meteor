Template.insertPlaylistForm.events = {
  'click #privacyToggle button' : function(e,template) {
    var btn = e.currentTarget;
    Session.set('playlistPrivacy',btn.getAttribute("data-action"));
    template.find('[data-schema-key=privacy]').value = btn.getAttribute("data-action");
  }
};

Template.playlistsEntry.events = {
  'click .playlist-container' : function(e,template) {
    Router.go('playlist',{_id:this._id});
  }
};

Template.playlistsEntry.helpers({
  'songCount': function() {
    return this.songs ? this.songs.length : 0;
  }
});
