// Configure SendGrid API Key, for system email.
Meteor.startup(function () {
    process.env.MAIL_URL = 'smtp://apikey:' +
        Meteor.settings.sendgrid.apiKey +
        '@smtp.sendgrid.net:587';
});

//Configuration for Facebook Oauth.
ServiceConfiguration.configurations.upsert({service: 'facebook'}, {
  $set: {
    appId: Meteor.settings.public.facebook.appId,
    secret: Meteor.settings.facebook.secret,
    loginStyle: 'popup'
  }
});

//Configuration for Google Oauth.
ServiceConfiguration.configurations.upsert({service: 'google'}, {
  $set: {
    clientId: Meteor.settings.google.clientId,
    secret: Meteor.settings.google.secret,
    loginStyle: 'popup'
  }
});
