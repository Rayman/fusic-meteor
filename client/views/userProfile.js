Template.userProfile.isOwner = function() {
  return Meteor.userId() == this._id;
}

Template.userProfile.rendered = function() {
  Session.setDefault("showEditAvatarBar",false);
}

Template.userProfile.userFriends = function() {
  return Meteor.users.find({_id: {$in: this.profile.friends}});
}
Template.userProfile.avatarUrl = function() {
  if(this.profile.avatar) { 
    return this.profile.avatar;
  } else {
    return "/img/avatar.jpg";
  }
}

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
  'click div.avatar': function() {
    Router.go('userProfile', {_id: this._id});
  }
}

Template.userPlaylist.songCount = function() {
  if(this.songs) {
    if(this.songs.length == 1) {
      return this.songs.length + " song";
    } else {
      return this.songs.length + " songs";
    }
  }
}

Template.editAvatar.events = {
  'click [data-action="update-avatar"]': function() {
    var avatar = $("input#avatarUrl").val();
    check(avatar,String);
    Meteor.users.update(
          {_id:  Meteor.userId()},
          {$set: {'profile.avatar':avatar}});
    Session.set("showEditAvatarBar",false);
  }
}

Template.addRemoveFriend.isFriend = function() {
  return _.contains(Meteor.user().profile.friends,this._id);
}

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
}