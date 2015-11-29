
/*****************************************************************************/
/* Loading: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Loading.events({
  /*
   * Example:
   *  'click .selector': function (e, tmpl) {
   *
   *  }
   */
});

Template.Loading.helpers({
     randomQuote: function () {
       var quotes = [
         ["Good things come to those who wait","Some random guy"],
         ["Rivers know this: there is no hurry. We shall get there some day.","A.A.Milne"],
         ["Patience is bitter, but its fruit is sweet","Aristotle"],
         ["Why is patience so important? <br/> Because it makes us pay attention.","Paulo Coelho"],
         ["Trees that are slow to grow bear the best fruit.","Moliere"],
         ["Patience is not simply the ability to wait - it's how we behave while we're waiting","Joyce Meyer"],
         ["You usually have to wait for that which is worth waiting for","Craig Bruce"],
         ["Have patience. All things are difficult before they become easy","Saadi"],
         ["Be patient and understanding. Life is too short to be vengeful or malicious","Phillips Brooks"]
       ];
       var i = Math.floor(quotes.length*Math.random());
       return "<p>"+quotes[i][0]+"</p><footer>"+quotes[i][1]+"</footer>";
     }
});

/*****************************************************************************/
/* Loading: Lifecycle Hooks */
/*****************************************************************************/
Template.Loading.created = function () {
};

Template.Loading.rendered = function () {
};

Template.Loading.destroyed = function () {
};
