//Format youtube duration to normal duration
Handlebars.registerHelper('calcTime', function(oldTime) {
  //Format PT15M51S --> 15 minutes 51 seconds
  var time = oldTime || "";
  return time.replace("PT","").replace("H",":").replace("M",":").replace("S","");
});