import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import _ from 'underscore';

Meteor.methods({
        //Get user's location based on geolocation data.
        'getLocation': function(location) {
          check(location, Match.OneOf(null,{
              lat: Number,
              lng: Number
            })
          )
          if ( location !== null ) {
            const settings = {
              geocoderProvider: "here",
              httpAdapter: "http",
              app: {
                appId: Meteor.settings.here.appId,
                appCode: Meteor.settings.here.appCode
              }
            };
            const geocoder = require('node-geocoder')(settings.geocoderProvider, settings.httpAdapter, settings.app);
            return geocoder.reverse({ lat: location.lat, lon: location.lng })
            .then( function(res) {
              return {
                city: res[0].city,
                region: res[0].state,
                country: res[0].country,
                countryCode: res[0].countryCode
              }
            });
          }
          else {
            return;
          }
        },

        //Upload location database from json file.
        'getLocationDB': function() {
            if ( LocationDB.find().count() <= 1 ) {
                let citiesDB = {};
                citiesDB = JSON.parse( Assets.getText('cities_db.json') );
                citiesDB.forEach(function(location){
                        LocationDB.insert({
                          city: location.city,
                          region: location.region,
                          country: location.country,
                          countryCode: location.countryCode
                        });
                });
            } else {
                return;
            }
        },

        //Get list of region from user's country.
        'getRegion': function(userCountry) {
          check(userCountry, String);
          return Meteor.wrapAsync(callback => {
              LocationDB.rawCollection().distinct('region', { countryCode: userCountry }, callback);
          })();
        },

        //Get list of city from user's region.
        'getCity': function(selectRegion) {
          check(selectRegion, String);
          return Meteor.wrapAsync(callback => {
            LocationDB.rawCollection().distinct('city', { countryCode: selectRegion }, callback);
          })();
        },

});
