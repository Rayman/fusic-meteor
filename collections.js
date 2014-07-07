SimpleSchema.debug = true;

Playlists = new Meteor.Collection('playlists', {
  schema: {
	owner: {
		// Force value to be current date (on server) upon insert
		// and prevent updates thereafter.
		type: String,
		autoValue: function () {
			if (this.isInsert) {
				return Meteor.userId();
			} else if (this.isUpsert) {
				return {$setOnInsert: Meteor.userId()};
			} else {
				this.unset();
			}
		},
		denyUpdate: true,
		optional: true // not working if not set
    },
	createdAt: {
		type: Date,
		autoValue: function () {
			if (this.isInsert) {
				return new Date;
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date};
			} else {
				this.unset();
			}
		},
		denyUpdate: true,
		optional: true // not working if not set
	},
    title: {
      type: String,
      label: "Playlist title",
      max: 100,
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
      max: 500
    },

    songs: {
      type: [Object],
      optional: true,
      max: 2000
    },

	"songs.$.author": {
        type: String,	//userId
		optional: true,
    },
    "songs.$.added": {
        type: Date, 	//Date Object
    },
	"songs.$.songId": {
        type: String,	//song Id
    }


  }
});

Songs = new Meteor.Collection('songs');

PlayCounts = new Meteor.Collection('playCounts', {
  schema: {
    songId: {
      type: String,
    },

    author: {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return this.userId;
        } else if (this.isUpsert) {
          return { $setOnInsert: this.userId };
        } else {
          this.unset();
        }
      }
    },

    createdAt: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return { $setOnInsert: new Date() };
        } else {
          this.unset();
        }
      }
    }
  }
});
