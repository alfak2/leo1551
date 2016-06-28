import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
  //Upload new listing.  Update listing count.
  'postListing': function( newListing ) {
      check(this.userId, String);
        check(newListing,
          {
            title: String,
            productID: String,
            sellPrice: Number,
            condition: String,
            meetLocation: String,
            listingNotes: Match.Optional(String)
          });

      let product = Products.findOne( { _id: newListing.productID } );
      let profile = Profile.findOne( { profID: this.userId } );

        var listing = _.extend(newListing, {
          views: 0,
          listOfferCount: 0,
          postDate: new Date(),
          country: profile.location.countryCode,
          sold: false,
          soldInfo: {
            soldPrice: null,
            soldDate: null
          },
          images: [],
          active: true,
          listedBy: this.userId,
          seller: Meteor.user().username
        });

      Products.update( {_id: listing.productID},{$inc: {listingsCount: 1} } );
      Profile.update( {_id: profile._id}, {$inc: {myListings: 1} } );

      return Listings.insert(listing);
  },

  //Upload changes to listing.
  'updateListing': function(postId, productId, updateListing) {
      check(this.userId, String);
      check(postId, String);
      check(productId, String);
        check(updateListing, {
          title: String,
          sellPrice: Number,
          condition: String,
          meetLocation: String,
          listingNotes: Match.Optional(String)
        });

      return Listings.update( { _id: postId, listedBy: this.userId }, {$set: updateListing });
  },

  //Upload images of listing.
  'insertImage': function(listId, imgId) {
      check(this.userId, String);
      check(listId, String);
      check(imgId, String);

      let img = Uploads.findOne({ _id: imgId });

      return Listings.update({
        _id: listId,
        listedBy: this.userId
      },{
        $push: {
          images: img._id
        }
      });
  }

});
