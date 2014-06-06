SimpleSchema.debug = true;

Playlists = new Meteor.Collection('playlists', {
  schema: {
    title: {
      type: String,
      label: "Playlist title",
      max: 100,
    },
    cover: {
      type: String,
      label: "Cover url",
      regEx: SimpleSchema.RegEx.Url,
    },
    tags: {
      type: String,
      label: "Tags",
    },
    description: {
      type: String,
      label: "A brief description of your playlist",
      optional: true,
      max: 1000,
    }
  }
});

Songs = new Meteor.Collection('songs');