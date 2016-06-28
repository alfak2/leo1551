import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('ShopCtrl', ShopCtrl);

function ShopCtrl (
                    $scope,
                    $state,
                    $reactive,
                    $rootScope,
                    $ionicLoading,
                    $ionicHistory,
                    $ionicViewSwitcher,
                    $stateParams,
                    $timeout
                  ){
  $reactive(this).attach($scope);
  var self = this;

  //Variables for infinite scroll.
  self.loaded = 10;
  self.limit = self.loaded;

  //Load products on scroll.
  this.subscribe('shopMain', () => [ self.getReactively('loaded') ], {
    onReady: function() {
      self.limit = self.loaded;
      $ionicLoading.hide();
      return;
    }
  });

  this.helpers({
    products: () => Products.find({
      listingsCount: { $gt: 0 }
    },{
      sort: {
        productOffersCount: -1,
        year: -1,
        listingsCount: -1,
        name: 1
      },
      limit: self.getReactively('limit')
    })
  });

  //Get count of all Products in server.
  //Method is located at tapshop/lib/methods/app_methods.js
  Meteor.call('allProducts', function(err, count) {
    self.allproducts = count;
  });

  //Get count of all Listings in server.
  //Method is located at tapshop/lib/methods/app_methods.js
  Meteor.call('allListings', function(err, count) {
    if(!err) {
      self.allposts = count;
    }
  });

  //Go to Search Page on tap of search text box.
  this.search = function() {
    $ionicViewSwitcher.nextDirection("enter");
    $state.go('app.search');
  }

  this.noPosts = 'No posts available.';

  //Infinite scroll function.
  $scope.loadMore = function() {
    $timeout( function(){
      self.loaded += 5;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, 2000);
  };

  //Refresher function.
  $scope.refresh = function() {
    self.loaded = 10;
    $state.reload('app.shop');
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    if ( !document.getElementById("content-main") ) {
      $rootScope.$broadcast('loadspinner');
    }
    viewData.enableBack = false;
    $ionicHistory.clearHistory();
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    this.searchText = '';

    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
    //Show Ad on this Page.
    //if (Meteor.isCordova && AdMob) {
    //  AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    //} else {
    //  return;
    //}
  });

  //$scope.$on('$ionicView.leave', function (event, viewData) {
    //Hide Ad on on leave.
    //if (Meteor.isCordova && AdMob) {
    //  AdMob.hideBanner();
    //} else {
    //  return;
    //}
  //});

  if ( $state.is('app.verify') === true && $stateParams.token ) {
    $rootScope.$broadcast('loadspinner');
    //Get token for email verification.
    //Method is located at tapshop/server/methods/profile_server.js
    Meteor.call('emailVerify', $stateParams.token, function(err){
      if(!err) {
        if (Meteor.isCordova) {
          $cordovaToast.showShortBottom('Account Verified');
        } else {
          toastr.success('Account Verified');
        }
        $ionicLoading.hide();
      } else {
        if (Meteor.isCordova) {
          $cordovaToast.showLongBottom('Could not verify. Please try again.');
        } else {
          toastr.error('Could not verify. Please try again.');
        }
        $ionicLoading.hide();
      }
    });
  }
};
