Template.userProfile.created = function() {
  Session.setDefault("showEditAvatarBar",false);
};

Template.userProfile.isOwner = function() {
  return Meteor.userId() == this._id;
};

Template.userProfile.userFriends = function() {
  var friends = this.profile.friends || [];
  return Meteor.users.find({_id: {$in: friends}});
};

Template.userProfile.events = {
  'click [data-action="set-username"]': function() {
    var newname = $("input#new-username").val();
    check(newname,String);
    Meteor.users.update(
          {_id:  Meteor.userId()},
          {$set: {'username':newname}});

  },
  'click [data-action="edit-avatar"]': function() {
    Session.set("showEditAvatarBar",!Session.get("showEditAvatarBar"));
  },
};

Template.userPlaylist.songCount = function() {
  if(this.songs) {
    if(this.songs.length == 1) {
      return this.songs.length + " song";
    } else {
      return this.songs.length + " songs";
    }
  }
};

Template.editAvatar.currentAvatar = function () {
  return Meteor.user();
};

Template.editAvatar.users = function () {
  return Meteor.users;
};


Template.addRemoveFriend.isFriend = function() {
  var user = Meteor.user();
  if (!user)
    return;
  return _.contains(Meteor.user().profile.friends,this._id);
};

Template.addRemoveFriend.events = {
  'click [data-action="add-friend"]': function() {
    Meteor.users.update(
      { _id: Meteor.userId() },
      { $addToSet : { 'profile.friends': this._id }}
    );
  },
  'click [data-action="remove-friend"]': function() {
    Meteor.users.update(
      { _id: Meteor.userId() },
      { $pull : { 'profile.friends': this._id }}
    );
  }
};
