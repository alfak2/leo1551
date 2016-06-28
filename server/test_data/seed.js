import { Meteor } from 'meteor/meteor';

// Fixture data

if (Products.find().count() !== 0 && Listings.find().count() === 0 && Profile.find().count() === 0) {
console.log('Seeding test data.');

  let testusers = [
      { id: 'test001',
        username: 'johndoe',
        image: '/images/users/profile_1.jpg'
       },
      { id: 'test002',
        username: 'martyx',
        image: '/images/users/profile_2.jpg'
       },
      { id: 'test003',
        username: 'loremipsum',
        image: '/images/users/profile_3.jpg'
       },
      { id: 'test004',
        username: 'batman',
        image: '/images/users/profile_4.jpg'
       },
  ];

  for (let i = 0; i < testusers.length; i++) {
      let newprofile = {
        profID: testusers[i].id,
        profName: testusers[i].username,
        profImage: testusers[i].image,
        profImageID: null,
        location: {
            city: 'Test City',
            country: 'Test Country',
            region: 'Test Region',
            contryCode: 'CC',
        },
        goodRating: 0,
        badRating: 0,
        myOffers: 0,
        myListings: 0,
        productSold: 0
      }
      Profile.insert(newprofile);
  };

  Products.find().forEach( function(thisProd) {

    let testUser = Profile.find().fetch();
    let x = Math.floor((Math.random() * 100)) + 4;

    for (let i = 0; i < x; i++) {
      let u = Math.round((Math.random() * 3));

      Listings.insert({
        productID: thisProd._id,
        title: 'Sample ' + thisProd.name + ' ' + i,
        sellPrice: Math.floor(Math.random()*10000) + 5000,
        condition: 'Used',
        images: [],
        meetLocation: 'Location' + i,
        listingNotes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        seller: testUser[u].profName,
        listedBy: testUser[u].profID,
        listViews: 0,
        offerCount: 0,
        postDate: new Date(),
        active: true,
        sold: false,
      });

      Products.update( {_id: thisProd._id},{$inc: {listingsCount: 1} } );
    }
  });
}
