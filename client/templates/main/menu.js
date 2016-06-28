import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('MenuCtrl', MenuCtrl);

function MenuCtrl (
                    $scope,
                    $reactive,
                    $state,
                    $sce,
                    $ionicViewSwitcher,
                    $ionicHistory,
                    $rootScope,
                    $ionicLoading
                  ) {

    $reactive(this).attach($scope);
    var self = this;

    this.subscribe('myMenu', () => [], {
      onReady: function() { return; }
    });

    this.autorun( () => {
      if( self.getCollectionReactively('myprofile') ) {
        if( !self.myprofile.location.countryCode ) {
          self.currentLoc = Geolocation.latLng();

          //Method is located at tapshop/server/methods/server_methods.js
          Meteor.call('getLocation', self.currentLoc, function(err, result) {
            if (!err) {
              //Method is located at tapshop/lib/methods/profile.js
              Meteor.call('updateLocation', result);
              return;
            }
            else {
              return;
            }
          });

        }
        else {
          return;
        }
      }
    });

    this.helpers({
        currentUser: () => Meteor.user(),
        myprofile: () => Profile.findOne({ profID: Meteor.userId() }),
        unreadFeed: () => Feeds.find({ userID: Meteor.userId(), read: false }).count(),
        unreadMsg: () => Messages.find({ for: Meteor.userId(), read: false }).count(),
        profileImg: () => ProfileImg.findOne({ userId: Meteor.userId() })
    });

    //Go to Shop tab.
    this.selectShop = function() {
        $ionicViewSwitcher.nextDirection("back");
        $state.go('app.shop');
    };

    //Go to Sell tab.
    this.selectSell = function() {
        if ( $state.is('app.shop') === true || $state.is('app.listings') === true  ) {
          $ionicViewSwitcher.nextDirection("forward");
        }
        else {
          $ionicViewSwitcher.nextDirection("back");
        }
        $state.go('app.sell');
    };

    //Go to Offers tab.
    this.selectMyOffer = function() {
        if ( $state.is('app.chatlist') === true ) {
          $ionicViewSwitcher.nextDirection("back");
        }
        else {
          $ionicViewSwitcher.nextDirection("forward");
        }
        $state.go('app.myoffers');
    };

    //Go to Messages tab.
    this.selectChat = function() {
        $ionicViewSwitcher.nextDirection("forward");
        $state.go('app.chatlist');
    };

    //Show logout button in side menu if its not on the web.
    if( Meteor.isCordova ){
      self.isMobile = true;
    }
    else {
      self.isMobile = false;
      this.logout = function() {
        $rootScope.$broadcast('loadspinner');
        Meteor.logout(function(err) {
          if (!err) {
            if ( $state.is('app.shop') ){
              $ionicLoading.hide();
            } else {
              $state.go('app.shop');
            }
          }
          else {
            $ionicLoading.hide();
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            return
          }
        });
      }
    }
};
