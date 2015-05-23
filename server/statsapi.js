/* global Meteor */
Meteor.methods({

  /**
   * Find songs that have been added to playlists very often and return it as static data
   */
  'getTopSongs' : function() {
    var topSongs = PlayCounts.aggregate([
      //group it by songid, count each occurence as "one"
      { $group: { _id: "$songId", count: { $sum: 1 } } },
      //song appears more than once
      { $match: { count: { $gt: 1 } } },
      //sort the result descending
      { $sort: {count:-1} },
      //limit the results
      { $limit : 25 }
    ]);

    var topIds = _.pluck(topSongs, "_id");
    var topSongsInfo = Songs.find({_id: {$in: topIds }    }).fetch();

    //merge the meta information into the (ordered) counts information
    var out = _.map(topSongs, function(songInfo) {
      var topSong = _.findWhere(topSongsInfo, {_id: songInfo._id });
      songInfo = _.extend(songInfo, topSong);
      console.log(songInfo.snippet.title);
      return songInfo;
    });

    return out;

  }


});
