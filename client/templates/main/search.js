import { Meteor } from 'meteor/meteor';
import { _meteorAngular } from 'meteor/angular';

angular
    .module('salephone')
    .controller('SearchCtrl', SearchCtrl);

function SearchCtrl (
    $scope,
    $state,
    $reactive,
    $rootScope,
    $timeout,
    $ionicLoading,
    $ionicPlatform,
    $ionicHistory,
    $ionicViewSwitcher,
    $cordovaToast,
    $ionicScrollDelegate
  ) {
    $reactive(this).attach($scope);
    var self = this;

    //Start with empty search results.
    self.searchResults = {};

    this.autorun( () => {
        //Run search function when there are characters on search input.
        if ( this.getReactively( 'search' ) ) {
            $timeout( function(){
              if ( !self.search ) {
                return;
              }
              else {
                Search.search( self.search );
                $ionicScrollDelegate.scrollTop();
                return;
              }
            }, 3000);
        }
    });

    this.helpers({
        listings() {
          return Search.getData({
            limit: 20,
            sort: {
              score: { $meta: "textScore" },
              listOfferCount: -1,
              views: -1,
              listingsCount: -1,
              postDate: -1,
              title: 1
            }
           });
        },
        isLoading() {
          return Search.getStatus().loading;
        }
    });

    //Run search on enter button.
    this.onEnter = function() {
      if (!self.search) {
        return;
      }
      else {
        $timeout( function(){
          Search.search( self.search );
          $ionicScrollDelegate.scrollTop();
          return;
        }, 2000);
      }
      if (Meteor.isCordova) {
        cordova.plugins.Keyboard.close();
      } else {
        document.getElementById("searchbox").blur();
      }
    }

    //Subscribe images of listings in search results.
    this.getImage = function(listing) {
      if ( listing.isFirst ) {
        $rootScope.$broadcast('loadspinner');
      }
      if ( !Uploads.findOne({ listID: listing.id }) ) {
        self.subscribe('searchListing', () => [ listing.id ], {
          onReady: function() {
            if ( listing.isLast ) {
              $ionicLoading.hide();
            }
            return;
          }
        })
      }
      else {
        if ( listing.isLast ) {
          $ionicLoading.hide();
        }
        return;
      }
    }

    //Get images of listings in search results.
    this.upload = function(id) {
      let upload = Uploads.findOne({ listID: id });
      if ( upload ) {
        return upload;
      } else {
        return;
      }
    };

    //Go to product page of listing.
    this.go = function(listingId) {
      $state.go('app.product', { listingId: listingId });
    };

    this.noResults = "No items found.";

    $ionicPlatform.onHardwareBackButton( function(){
      if ( $ionicHistory.backView() === null ) {
        $ionicViewSwitcher.nextDirection("back");
        $state.go('app.shop');
      }
    });

    $scope.$on('$ionicView.afterEnter', function (event, viewData) {
        $ionicLoading.hide();
        document.getElementById("searchbox").focus();
    });
};
