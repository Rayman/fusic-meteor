(function(){ Playlists = new Meteor.Collection("playlists");


//ROUTING
Router.configure({
  layoutTemplate: 'layout', //normally pass layout to a "normal"  template
  notFoundTemplate: 'notFound', //invalid url screen
  loadingTemplate: 'loading' 	//novat valid screen
});

//mapping van paden naar templates, standaard wordt home template gebruikt en naar "layout" template gestuurd
Router.map(function() {

//Default route -> Homepage
  this.route('home', {
	path: '/',
	template: 'home' 
	});
	
//playlist view route	
  this.route('viewlist', {
	path: '/show/:playlistid',
	template: 'showPlayList',
	data: function() {
		var listId = this.params.playlistid;
		return Playlists.findOne({_id:listId});
	}
	});
});


//Client javascript

if (Meteor.isClient) {

	Template.home.playlists = function() {
		return Playlists.find({});
	};

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	//	shouldnt be here anyway, but in a separate file on the server
	
	//on boot remove all playlists
	Playlists.remove({});
	
	//add dummy data
	//we should think about the playlist object, how it looks etcetera..
	Playlists.insert({	name: "hitmen playlist", 
						created: new Date(),
						tags: [],
						songs: ["oOT2-OTebx0"] //youtube id's?
						
						
						
					});
						
  });
}

}).call(this);
