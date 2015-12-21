Template.header.user = function (){
  return Meteor.user();
};

Template._loginButtonsLoggedInDropdown.events({
    'click .nav-editprofile': function(event) {
        Router.go("userProfile", {"_id": Meteor.userId()} );
    },
    'click .nav-reportissue': function(event) {
        window.open("https://github.com/Rayman/fusic-meteor/issues?state=open");
    }
});
