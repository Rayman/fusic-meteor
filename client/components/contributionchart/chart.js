Template.contributionChart.rendered = function () {
  if (!this.data)
    return;

  var width = 300,
      height = 200,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.amount; });

  var svg = d3.select(this.find('svg'))
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var groups = _.groupBy(this.data.songs, 'author');
  var users = _.map(groups, function (songs, author) {
    var user = Meteor.users.findOne({_id: author});
    user = user ? user.username : "";
    return {
      name: user,
      amount: songs.length,
    };
  });

  var g = svg.selectAll(".arc")
      .data(pie(users))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.name; });
};
