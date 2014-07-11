Template.userProfile.isOwner = function() {
  return Meteor.userId() == this._id;
}

Template.userProfile.rendered = function() {
  Session.setDefault("showEditAvatarBar",false);
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
