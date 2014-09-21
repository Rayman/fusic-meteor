//Global events that should happen throughout all templates or respond to complete website --> Shouldn't be responsive

//example, make sure search result box hides when user clicks anywhere,
//not just within the current template
Template.MasterLayout.rendered = function () {
  //hiding results appropriately
  $(document.body).on('mouseup', function (e) {
  var search = $("#searchArea");
  var results = $("#searchresults");
    if (!search.is(e.target) && // if the target of the click isn't the container...
        search.has(e.target).length === 0 &&  // ... nor a descendant of the container
        results.is(':visible') //and results are currently visible
    ) {
      results.fadeOut('fast');
    }
  });

  $(document.body).on('click', 'a[rel="external"]', function(e) {
    e.stopPropagation(); // prevent queueing
    e.preventDefault(); // prevent linking in current window
    console.log('opening in new window');
    window.open(e.currentTarget.href, '_blank');
  });
};
