SimpleSchema.debug = true;

  
//User Profile Schema
UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    lastName: {
        type: String,
        regEx: /^[a-zA-Z]{2,25}$/,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    lovedSongs: {
      type: [String], 
    },
    avatar: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    friends: {
      type: [String]
    },
    following: {
      optional:true,
      type: [String],
    },
    playing: {
      optional:true,
      type: Object,
      blackbox:true,
    }
    
    
});

//User Schema
UserSchema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/
    },
    emails: {
        type: [Object]
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    }
});

Meteor.users.attachSchema(UserSchema);

//Playlist Schema
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
    privacy: {
        type: String,
        //public: everyone can edit
        //viewonly: everyone can see playlist, but can't edit
        //private: other users other than owner can't see the playlist
        label: "Set playlist privacy level",
        allowedValues: ['public', 'viewonly', 'private'],
        defaultValue: 'public'
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

//Songcache
Songs = new Meteor.Collection('songs');

//PlayCounts schema
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
