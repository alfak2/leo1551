import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'seed': function( postID ) {
        check( this.userId, String );
        check( postID, String );

        let testusers = [
            { id: 'test001',
              username: 'johndoe',
            },
            { id: 'test002',
              username: 'martyx',
            },
            { id: 'test003',
              username: 'loremipsum',
            },
            { id: 'test004',
              username: 'batman',
            },
        ];
        let thisPost = Listings.findOne({ _id: postID });

        testusers.forEach( function(user) {
            let thisUser = Profile.findOne({ profID: user.id });

            let offer = {
                listingID: postID,
                offerAmount: Math.floor(Math.random()*9000) + 1000,
                offerDate: new Date(),
                offerBy: user.id,
                buyer: user.username
            }
            let chat = {
                listingID: postID,
                prodName: thisPost.title,
                agreedPrice: thisPost.sellPrice,
                buyer: user.id,
                buyerName: user.username,
                seller: thisPost.listedBy,
                sellerName: thisPost.seller,
                latestMsg: new Date(),
                buyerActive: true,
                sellerActive: true
            };
            let feed = {
                userID: thisPost.listedBy,
                postDate: new Date(),
                linkID: thisPost._id,
                linkType: 'mypost',
                body: "<b>" + user.username + "</b>" + " sent an offer to your post: " + "<b>" + thisPost.title + "." + "</b>",
                read: false,
            }

            Listings.update({ _id: postID }, { $inc: { listOfferCount: 1 }});
            Products.update({ _id: thisPost.productID }, { $inc: { productOffersCount: 1 }});
            Profile.update({ _id: thisUser._id },{ $inc: { myOffers: 1 }});
            Offers.insert(offer);
            Feeds.insert(feed);
            ChatRoom.insert(chat, function(err, chatid) {
                if (!err) {
                    let newMsg = {
                        body: 'Hello there!',
                        chatID: chatid,
                        sentBy: user.id,
                        for: thisPost.listedBy,
                        user: user.username,
                        sent: new Date(),
                        read: false
                    };
                    let testRating = Math.random() >= 0.5;
                    let feedback = {
                        chatID: chatid,
                        goodRating: testRating,
                        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                        user: thisPost.listedBy,
                        postBy: user.id,
                        postName: user.username,
                        postDate: new Date(),
                    }
                    let prof = Profile.findOne({ profID: thisPost.listedBy });
                    if (testRating === true) {
                        Profile.update( { _id: prof._id }, { $inc: { goodRating: 1 } } );
                    } else if (testRating === false)  {
                        Profile.update( { _id: prof._id }, { $inc: { badRating: 1 } } );
                    }
                    Messages.insert(newMsg);
                    Feedback.insert(feedback);
                }
             });
        });
        console.log('Seed complete.');
    },
    'seedImages': function() {
      let testUsers = ['test001', 'test002', 'test003', 'test004']
      if ( Listings.find({ listedBy: { $in: testUsers }, images: [] }).count() !== 0 ){
        console.log('Getting Images.');
        let a = 0;
        let images = {
          accessories: [
            'images/listings/accessories1.jpg',
            'images/listings/accessories2.jpg',
            'images/listings/accessories3.jpg',
            'images/listings/accessories4.jpg'
          ],
          beauty: [
            'images/listings/beauty1.jpg',
            'images/listings/beauty2.jpg',
            'images/listings/beauty3.jpg',
            'images/listings/beauty4.jpg'
          ],
          clothes: [
            'images/listings/clothes1.jpg',
            'images/listings/clothes2.jpg',
            'images/listings/clothes3.jpg',
            'images/listings/clothes4.jpg'
          ],
          computer: [
            'images/listings/computer1.jpg',
            'images/listings/computer2.jpg',
            'images/listings/computer3.jpg',
            'images/listings/computer4.jpg'
          ],
          food: [
            'images/listings/food1.jpg',
            'images/listings/food2.jpg',
            'images/listings/food3.jpg',
            'images/listings/food4.jpg'
          ],
          gadget: [
            'images/listings/gadget1.jpg',
            'images/listings/gadget2.jpg',
            'images/listings/gadget3.jpg',
            'images/listings/gadget4.jpg'
          ],
          home: [
            'images/listings/home1.jpg',
            'images/listings/home2.jpg',
            'images/listings/home3.jpg',
            'images/listings/home4.jpg'
          ],
          toys: [
            'images/listings/toys1.jpg',
            'images/listings/toys2.jpg',
            'images/listings/toys3.jpg',
            'images/listings/toys4.jpg'
          ]
        }
        Listings.find({ listedBy: { $in: testUsers }, images: [] }).forEach( function(listing){
          let product = Products.findOne({ _id: listing.productID });

          if ( product.name === 'Gadgets' ) { var image = images.gadget }
          else if ( product.name === 'Computers' ) { var image = images.computer }
          else if ( product.name === 'Fashion & Clothing' ) { var image = images.clothes }
          else if ( product.name === 'Accessories' ) { var image = images.accessories }
          else if ( product.name === 'Toys & Hobbies' ) { var image = images.toys }
          else if ( product.name === 'Home & Furniture' ) { var image = images.home }
          else if ( product.name === 'Food Products' ) { var image = images.food }
          else if ( product.name === 'Health & Beauty' ) { var image = images.beauty }

          let imageUrl = Meteor.absoluteUrl( image[a] );
          a++;
          if (a > 3) {
            a = 0;
          }

          let file = {
            listID: listing._id
          }
          UploadFS.importFromURL(imageUrl, file, UploadStore, function (err, fileId) {
            if (err) {
              UploadFS.importFromURL(imageUrl, file, UploadStore, function (err, fileId) {
                if(!err) {
                  Listings.update({
                    _id: listing._id,
                  },{
                    $push: {
                      images: fileId
                    }
                  });
                }
              })
              console.log("Upload Error: " + err);
              return;
            }
            else {
              Listings.update({
                _id: listing._id,
              },{
                $push: {
                  images: fileId
                }
              });
            }
          });
        });
      }
      else {
        return;
      }
    }
});
