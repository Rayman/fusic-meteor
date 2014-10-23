Template.contributionChart.rendered = function () {
  if (!this.data)
    return;

  /*
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
  */

  var data = [
    {
      "name": "hm5",
      "amount": 2
    },
    {
      "name": "Rayman",
      "amount": 7
    },
    {
      "name": "terence",
      "amount": 5
    },
    {
      "name": "wesley",
      "amount": 14
    },
    {
      "name": "omar",
      "amount": 11
    },
    {
      "name": "stefan",
      "amount": 26
    },
    {
      "name": "ThomHurks",
      "amount": 11
    },
    {
      "name": "rein",
      "amount": 10
    },
    {
      "name": "sirxemic",
      "amount": 2
    },
    {
      "name": "Paulm",
      "amount": 3
    },
    {
      "name": "Ka1wa",
      "amount": 4
    }
  ];

  var width = 420,
      barHeight = 20;

  var x = d3.scale.linear()
      .domain([0, 50])
      .range([0, width]);

  var chart = d3.select(this.find('svg'))
      .attr("width", width)
      .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) {
        return "translate(0," + i * barHeight + ")";
      });

  bar.append("rect")
      .attr("width", x)
      .attr("height", barHeight - 1);

  bar.append("text")
      .attr("x", function(d) {
        return x(d.amount) - 3;
      })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

};
