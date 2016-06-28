import { Meteor } from 'meteor/meteor';

Meteor.startup(function(){
  Meteor.call('seedImages'); //Insert test data images. Please remove on production.
})
