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
