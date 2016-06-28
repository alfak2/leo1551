import { Meteor } from 'meteor/meteor';

Meteor.startup(function () {
  Push.Configure({
    gcm: {
      apiKey: Meteor.settings.gcm.apiKey
    },
    production: true,
    badge: true,
    sound: true,
    alert: true,
    vibrate: true,
    sendInterval: 3000,
    sendBatchSize: 1
  });
});

Meteor.methods({
  'sendNotification': function(user) {
    check(user, String);
    Push.send({
      from: 'TapShop',
      title: 'TapShop',
      text: 'You have a new message.',
      badge: 1,
      query: {
        userId: user
      }
    });
  }
});
