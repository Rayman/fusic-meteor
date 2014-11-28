Template.radio.helpers({
  radioSongs: function () {
    var radioSongs = RadioSongs.find({radioId: this._id}).fetch();

    _.each(radioSongs, function (rs) {
      var songInfo = Songs.findOne({_id: rs.songId});

      rs.votes = _.map(rs.votes, function (vote) {
        return Meteor.users.findOne({_id: vote});
      });

      rs.song = songInfo;
    });

    return radioSongs;
  },
});

Template.radioSong.events({
  'click [data-action="voteup"]': function (e, template) {
    var id = template.data._id;
    console.log('voting for', id);
    RadioSongs.update(
      { _id: id },
      { $addToSet : {'votes': Meteor.userId()} }
    );
  }
});
