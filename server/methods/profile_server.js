import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
  //Upload new profile to database.
  'uploadProfile': function(newProfile) {
    check(this.userId, String);
    check(newProfile, {
      location: {
        city: Match.OneOf(String, null),
        country: Match.OneOf(String, null),
        region: Match.OneOf(String, null),
        countryCode: Match.OneOf(String, null)
      }
    });
    if ( Profile.find({ profID: this.userId }).count() === 0 ) {
      let defaultImg = "/images/users/profile_default.png";
      let profile = _.extend(newProfile, {
        profID: this.userId,
        profName: Meteor.users.findOne({ _id: this.userId }).username,
        profImage: defaultImg,
        profImageID: null,
        goodRating: 0,
        badRating: 0,
        myOffers: 0,
        myListings: 0,
        productSold: 0
      });

      //Remove comment below to enable verification email:
      //if ( Meteor.user().emails[0].verified === false ) {
      //  Accounts.sendVerificationEmail(this.userId);
      //}

      return Profile.insert(profile);
    }
    else {
      return;
    }
  },

  //Upload changes to user profile.
  'updateProfile': function(userID, newProfile) {
    check(this.userId, String);
    check(userID, String);
    check(newProfile, {
      username: String,
      city: Match.OneOf(String, null),
      region: Match.OneOf(String, null),
      country: Match.OneOf(String, null),
      countryCode: Match.OneOf(String, null),
    });

    if ( userID === this.userId ) {
      let profile = Profile.findOne({ profID: this.userId });
      Profile.update({
        _id: profile._id,
        profID: this.userId
      },{
        $set: {
          'location.city': newProfile.city,
          'location.region': newProfile.region,
          'location.country': newProfile.country,
          'location.countryCode': newProfile.countryCode
        }
      });
      if ( Meteor.users.findOne({ _id: this.userId }).username != newProfile.username ) {

        Meteor.users.update({
          _id: this.userId
        },{
          $set: {
            username: newProfile.username
          }
        });
        Profile.update({
          _id: profile._id,
          profID: this.userId
        },{
          $set: {
            profName: newProfile.username
          }
        });

        if ( Listings.find({ listedBy: this.userId }).count() != 0 ) {
          Listings.find({ listedBy: this.userId }).forEach( function(thisPost) {
            Listings.update({
              _id: thisPost._id
            },{
              $set: {
                seller: newProfile.username
              }
            });
          });
        }

        if ( Offers.find({ offerBy: this.userId }).count() != 0) {
          Offers.find({ offerBy: this.userId }).forEach( function(thisOffer) {
            Offers.update({
              _id: thisOffer._id
            },{
              $set: {
                buyer: newProfile.username
              }
            });
          })
        }

        if ( ChatRoom.find({ buyer: this.userId }).count() != 0 ) {
          ChatRoom.find({ buyer: this.userId }).forEach( function(thisChat) {
            ChatRoom.update({
              _id: thisChat._id
            },{
              $set: {
                buyerName: newProfile.username
              }
            });
          });
        }

        if ( ChatRoom.find({ seller: this.userId }).count() != 0 ) {
          ChatRoom.find({ seller: this.userId }).forEach( function(thisChat) {
            ChatRoom.update({
              _id: thisChat._id
            },{
              $set: {
                sellerName: newProfile.username
              }
            });
          });
        }

        if ( Messages.find({ sentBy: this.userId }).count() != 0 ) {
          Messages.find({ sentBy: this.userId }).forEach( function(thisMsg) {
            Messages.update({
              _id: thisMsg._id
            },{
              $set: {
                user: newProfile.username
              }
            });
          });
        }

        if ( Feedback.find({ postBy: this.userId }).count() != 0 ) {
          Feedback.find({ postBy: this.userId }).forEach( function(thisFeedback) {
            Feedback.update({
              _id: thisFeedback._id
            },{
              $set: {
                postName: newProfile.username
              }
            });
          })
        }
      }
    }
  },

  //Check if user profile is registered.
  'isRegistered': function() {
    check(this.userId, String);
    if ( Profile.find({ profID: this.userId }).count() === 0 ) {
      return false;
    }
    else {
      return true;
    }
  },

  //Create new profile, if profile was not created during register.
  'signupError': function() {
    check(this.userId, String);
    if ( Profile.find({ profID: this.userId }).count() === 0 ) {
      let newProfile = {
        location: {
          city: null,
          country: null,
          region: null,
          countryCode: null
        }
      };
      //Method is located at tapshop/server/methods/profile_server.js
      Meteor.call('uploadProfile', newProfile, function(err){
        if (!err) {
          return;
        }
        else {
          Meteor.users.remove({_id: this.userId});
          return;
        }
      });
    }
    else {
      return;
    }
  },

  //Verify email address with token.
  'emailVerify': function(token) {
    Accounts.onEmailVerificationLink( function(token){
      Accounts.verifyEmail(token)
    })
  },

  //Send reset password email to user.
  'resetPwd': function(email) {
    check(email, String);
    let user = Accounts.findUserByEmail( email );
    if (user) {
      Accounts.sendResetPasswordEmail(user._id)
    }
    else {
      throw new Meteor.Error('Not Registered');
    }
  },


  //Check if user is registered with password.
  'hasPassword': function() {
    check(this.userId, String);
    if ( !Meteor.users.findOne({ _id: this.userId }).services.password ) {
      return false;
    }
    else {
      return true;
    }
  },

  //Check if username exists.
  'checkName': function(user) {
    check(user, String);
    if (
      Profile.find({ profID: { $ne: this.userId }, profName: user }).count() != 0 &&
      Meteor.users.find({ _id: { $ne: this.userId }, username: user }).count() != 0
    ) {
      return false;
    }
    else {
      return true;
    }
  }
});
