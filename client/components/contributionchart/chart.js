Template.contributionChart.rendered = function () {
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
      .value(function(d) { console.log(d); return d.values.length; });

  var svg = d3.select(this.find('svg'))
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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

    svg.selectAll(".arc").remove();
    var g = svg.selectAll(".arc")
        .data(pie(songsByUser))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.key); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.key; });
    });
};
