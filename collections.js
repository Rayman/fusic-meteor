SimpleSchema.debug = true;

Playlists = new Meteor.Collection('playlists', {
  schema: {
    title: {
      type: String,
      label: "Playlist title",
      max: 255,
    },
    cover: {
      type: String,
      label: "Cover url",
      regEx: SimpleSchema.RegEx.Url,
	  optional: true,
    },
    tags: {
      type: String,
      label: "Tags",
	  optional: true,
    },
    description: {
      type: String,
      label: "A brief description of your playlist",
      optional: true,
      max: 1000
    },

    songs: {
      type: [String],
      optional: true,
      max: 2000
    }
  }
});

Songs = new Meteor.Collection('songs');