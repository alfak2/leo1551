import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('RegCtrl', RegCtrl);

 function RegCtrl (
                    $scope,
                    $reactive,
                    $http,
                    $state,
                    $cordovaToast,
                    $ionicLoading,
                    $rootScope
                  ){
  $reactive(this).attach($scope);
  AccountsTemplates.setState("signUp");
  var self = this;

  //Get geolocation of user.
  if ( !Meteor.userId() ) {
    self.currentLoc = Geolocation.latLng();
  }

  this.autorun( () => {
    if ( Meteor.loggingIn() === true ) {
      $rootScope.$broadcast('loadspinner');
    }
    if ( Meteor.loggingIn() === false ) {
      $ionicLoading.hide();
    }
    if ( Meteor.userId() ) {
      $rootScope.$broadcast('loadspinner');
      // Geolocaiton of user.
      self.currentLoc = Geolocation.latLng();
      //Check if user is already registered.
      //Method is located at tapshop/server/methods/profile_server.js
      Meteor.call('isRegistered', function(err, registered){
        if ( registered === false ) {
          //Get user location using geolocation data.
          //Method is located at tapshop/server/methods/server_methods.js
          Meteor.call('getLocation', self.currentLoc, function(err, loc) {
            if ( loc ) {
              var newProfile = {
                location: {
                  city: loc.city,
                  region: loc.region,
                  country: loc.country,
                  countryCode: loc.countryCode
                }
              }
              //Create separate user profile for public.
              self.createProfile(newProfile);
            }
            else {
              console.log( "Error getting location." );
              var newProfile = {
                location: {
                  city: null,
                  region: null,
                  country: null,
                  countryCode: null
                }
              }
              self.createProfile(newProfile);
            }
          });
        }
        else if ( registered === true ) {
          $state.go('app.shop');
        }
        else {
          Meteor.logout(function() {
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
              }
              $state.reload('app.register');
            });
          }
        });
      }
  });

  //Oauth login with Facebook.
  this.loginFB = function() {
    Meteor.loginWithFacebook({
      requestPermissions: ['email', 'public_profile'],
      redirectUrl: Meteor.absoluteUrl('_oauth/facebook')
    }, function(err){
      if( err.error === 'Email exists.' ) {
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Account is not verified. Please check your email on how to verify your account.');
        } else {
          toastr.error('Account is not verified. Please check your email on how to verify your account.');
        }
      }
    });
  };

  //Oauth login with Google.
  this.loginGoogle = function() {
    Meteor.loginWithGoogle({
      requestPermissions: ['email', 'profile'],
      redirectUrl: Meteor.absoluteUrl('_oauth/google')
    }, function(err){
      if( err.error === 'Email exists.' ) {
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Account is not verified. Please check your email on how to verify your account.');
        } else {
          toastr.error('Account is not verified. Please check your email on how to verify your account.');
        }
      }
    });
  };

    this.createProfile = function(newProfile) {
      //Create separate user profile for public.
      //Method is located at tapshop/server/methods/profile_server.js
      Meteor.call('uploadProfile', newProfile, function(err, profile){
        if (!err) {
          if (Meteor.isCordova) {
            $cordovaToast.showShortBottom('Account Registered');
          } else {
            toastr.success('Account Registered');
          }
          Session.keys = {};
          $state.go('app.shop');
        }
        else {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } else {
            toastr.error('Error. Please try again.');
          }
          //Method is located at tapshop/server/methods/profile_server.js
          Meteor.call('signupError', function(err){
            Meteor.logout(function() {
              if (Meteor.isCordova) {
                $cordovaToast.showLongBottom('Error. Please try again.');
              } else {
                toastr.error('Error. Please try again.');
              }
              $state.reload('app.login');
            });
          })
        }
      });
    };

    $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
      if ( Meteor.loggingIn() === false ) {
        $ionicLoading.hide();
      }
    });

    $scope.$on('$ionicView.afterEnter', function () {
        $ionicLoading.hide();
    });
 };
