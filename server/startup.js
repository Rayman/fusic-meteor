/**
 * Dont commit this file with the keys still in place!
 */

Meteor.startup(function () {
  //on boot, initialize spotify login service
  ServiceConfiguration.configurations.update(
    { "service": "spotify" },
    {
      $set: {
        "clientId": "<YOUR CLIENTID>",
        "secret": "<YOUR SECRET>"
      }
    },
    { upsert: true }
  );
});
