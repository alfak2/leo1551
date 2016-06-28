import { Mongo } from 'meteor/mongo';

//Image uploads for Listings.
Uploads = new Mongo.Collection('uploads');

UploadStore = new UploadFS.store.GridFS({
  collection: Uploads,
  name: 'uploads',
  path: '/uploads',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  })
});

//Image uploads of user profile.
ProfileImg = new Mongo.Collection('profileImg');

ProfileStore = new UploadFS.store.GridFS({
  collection: ProfileImg,
  name: 'profileImg',
  path: '/uploads/profile',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  })
});

Uploads.allow({
  insert: function(userId, doc) {
    return (userId && doc.userId === userId);
  },
  update: function(userId, doc) {
    return (doc.userId === userId);
  },
  remove: function(userId, doc){
    return (doc.userId === userId);
  }
});

ProfileImg.allow({
  insert: function(userId, doc) {
    return (userId && doc.userId === userId);
  },
  update: function(userId, doc) {
    return (doc.userId === userId);
  },
  remove: function(userId, doc){
    return (doc.userId === userId);
  }
});

ProfileImg.deny({
  remove: function(){
    return true;
  }
});
