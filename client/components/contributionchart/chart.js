Template.contributionChart.rendered = function () {
  var width = 300,
      height = 200,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.category20c();

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.values.length; });

  var svg = d3.select(this.find('svg'))
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var tweenPie = function (a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  };



  //this part re-runs when new data is entered
  this.autorun(function() {
    var data = Template.currentData();
    if (!data)
      return;

    var songsByUser = d3.nest()
      .key(function(song) {
        var user = Meteor.users.findOne({_id: song.author});
        return user ? user.username : "";
      })
      .entries(data.songs);

    //svg.selectAll(".arc").remove();
    var update_sel = svg.selectAll(".arc")
        .data(pie(songsByUser));

    //enter()
    var enter_sel = update_sel.enter().append("g")
        .attr("class", "arc");

    enter_sel.append("path")
        .style("fill", function(d) { return color(d.data.key); })
        .each(function(d) {
          this._current = {data: d.data,
            value: d.value,
            startAngle: 0,
            endAngle: 0};
        });

    enter_sel.append("text")
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .style("opacity",1)
        .style("font-size","14px")
        .attr("transform", "translate(0,0)")
        .text(function(d) { return d.data.key; });

    //enter + update
    update_sel.select("path").transition()
      .duration(500)
      .attrTween("d", tweenPie);

    //reselect text labels
    update_sel.select("text").transition()
    .duration(500)
    .style("font-size", function(d) {
      var delta = Math.abs(d.startAngle - d.endAngle);
      console.log(delta);
      return ( delta < 0.7) ? "10px" : " 14px"; })
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });

    //exit
    update_sel.exit().remove();

    });
};
