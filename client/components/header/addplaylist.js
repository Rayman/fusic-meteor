Template.addPlaylist.rendered = function() {
  Session.setDefault('playlistPrivacy','public');
  this.find('[data-schema-key=privacy]').value = 'public';
  $("button").tooltip();

  AutoForm.hooks({
    insertPlaylistForm: {
      onSuccess: function(operation, result, template) {
        Router.go('/playlist/'+result);
        $("#addPlaylistModal").modal('hide');
      }
    }
  });
};
