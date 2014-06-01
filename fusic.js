//ROUTING
Router.configure({
  layoutTemplate: 'layout',
});

//mapping van paden naar templates, standaard wordt home template gebruikt en naar "layout" template gestuurd
Router.map(function() {
  this.route('home', {
	path: '/',
	template: 'home' 
	});
});


//Client javascript

if (Meteor.isClient) {

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	//	shouldnt be here anyway, but in a separate file on the server
  });
}
