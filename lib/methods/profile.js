import { Meteor } from 'meteor/meteor';

Meteor.methods({

  //Chnage uploaded profile image for user.
  'updateProfImg': function(imgId) {
    check(this.userId, String);
    check(imgId, String);
    let thisProf = Profile.findOne({ profID: this.userId });

    return Profile.update({
      _id: thisProf._id,
      profID: this.userId
    },{
      $set: {
        profImageID: imgId
      }
    });
  },

  //Remove profile image of user.
  'removeImage': function(imgId) {
    check(this.userId, String);
    check(imgId, String);

    let thisProf = Profile.findOne({ profID: this.userId });
    let profImgURL = "/images/users/profile_default.png";

    if ( ProfileImg.findOne({ _id: imgId, userId: this.userId }) ) {
        ProfileImg.remove({ _id: imgId, userId: this.userId });
    }

    return Profile.update({
      _id: thisProf._id,
      profID: this.userId
    },{
      $set: {
        profImage: profImgURL,
        profImageID: null
      }
    });
  },

  //Update location details of user.
  'updateLocation': function(data) {
    check(this.userId, String);
    check(data, {
      city: Match.OneOf(String, null),
      region: Match.OneOf(String, null),
      country: Match.OneOf(String, null),
      countryCode: Match.OneOf(String, null)
    });
    let profile = Profile.findOne({ profID: this.userId });
    if ( !profile.location.countryCode ) {
      return Profile.update({
        _id: profile._id,
        profID: this.userId
      },{
        $set: { location: data }
      });
    } else {
      return;
    }
  },

  //Update City of user.
  'updateCity': function(userID, geoLoc) {
    check( this.userId, String );
    check( geoLoc, Match.OneOf(String, null) );
    check( userID, String );

    return Profile.update( {
      _id: userID,
      profID: this.userId
    },{
      $set: {
        'location.city': geoLoc
      }
    });
  },

});
