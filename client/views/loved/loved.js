Template.loved.events = {
  'click [data-action="remove"]': function (e) {
	//loved songs are stored in users profile
	Meteor.users.update(
                    { _id: Meteor.userId()	},
                    { $pull : { 'profile.lovedSongs': this._id }}
                  );	
  },
  'mouseenter p' : function(event, template) {
	$(event.target).find(".songoptions").removeClass("hidden");
  },
  'mouseleave p' : function(event, template) {
	$(event.target).find(".songoptions").addClass("hidden");
  }
}