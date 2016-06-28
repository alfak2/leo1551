import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publishComposite('myMenu', function() {
  return {
    find: function() {
      return Profile.find({ profID: this.userId }, { limit: 1 });
    },
    children: [{
      find: function(profile) {
        return ProfileImg.find({ userId: this.userId }, { limit: 1 });
      }
    },{
      find: function(profile) {
        return Messages.find({ for: this.userId, read: false });
      }
    },{
      find: function(profile) {
        return Feeds.find({ userID: this.userId, read: false }, { fields: { userID: true, read: true } });
      }
    }]
  }
});

Meteor.publishComposite('myFeedback', function(setlimit){
  check(setlimit, Match.Integer);
  return{
    find: function() {
      return Feedback.find({
        user: this.userId
      },{
        sort: { postDate: -1 },
        limit: setlimit,
        fields: { chatID: false }
      })
    },
    children: [{
      find: function(feedback){
        return Profile.find({
          profID: feedback.postBy
        },{
          fields: {
            myOffers: false,
            myListings: false,
            productSold: false,
            badRating: false,
            goodRating: false,
            location: false
          },
          limit: 1
        });
      }
    },{
      find: function(feedback){
        return ProfileImg.find({ userId: feedback.postBy }, { limit: 1 });
      }
    }]
  }
});

Meteor.publish('locationDB', function() {
    if ( Profile.findOne({ profID: this.userId }) ) {
      let profile = Profile.findOne({ profID: this.userId });
      return LocationDB.find({ countryCode: profile.location.countryCode });
    } else {
      return;
    }
});

//Others

Meteor.publish('getLocation', function(country) {
    check(country, String);
    return LocationDB.find({ countryCode: country});
});

Meteor.publishComposite('activities', function(setlimit){
  check(setlimit, Match.Integer);
  return {
    find: function() {
      return Feeds.find({
        userID: this.userId
      },{
        limit: setlimit,
        sort: { postDate: -1 }
      })
    },
    children: [{
      find: function(feed) {
        if ( feed.linkType === 'product' || feed.linkType === 'mypost' ) {
          return  Listings.find({
            _id: feed.linkID
          },{
            fields: { _id: true },
            sort: { postDate: -1 },
            limit: 1
          });
        }
      }
    }]
  }
});
