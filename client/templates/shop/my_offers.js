import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('MyOfferCtrl', MyOfferCtrl);

 function MyOfferCtrl (
                        $scope,
                        $reactive,
                        $rootScope,
                        $state,
                        $ionicLoading,
                        $ionicHistory,
                        $timeout,
                        $ionicScrollDelegate
                      ){

   $reactive(this).attach($scope);
   var self = this;

  //Variable for pagination.
   self.paginate = false;

  //Variables for infinite scroll.
   self.options = {
     loaded: 10,
     skip: 0
   };
   self.limit = self.options.loaded;

   //IDs of all listings with user's offer.
   self.postIDs = [];

   //Method is located at tapshop/lib/methods/app_methods.js
   Meteor.call('allOffers', function(err, count) {
     self.allposts = count;
   });

  //Load listings on scroll.
   this.subscribe('myOfferIndex', () => [ self.getReactively('options', true) ], {
     onReady: function() {
       self.limit = self.options.loaded;
       let publishedCount = Listings.find({ active: true }).count();

       if (
         (self.options.loaded >= 50 && ( self.options.skip + self.options.loaded ) < self.allposts) ||
         (self.options.skip !== 0 && ( self.options.skip + self.options.loaded ) >= self.allposts)
       ){
         self.paginate = true;
       }
       for (let i = 0; i < self.myOffers.length; i++) {
         self.postIDs.push(self.myOffers[i].listingID)
       }
       $ionicLoading.hide();
       return;
     }
   });

  //Detect changes on listings with user's offer.
  this.autorun( () => {
    if ( self.getCollectionReactively('myOffers') ) {
      let newPosts = [];
      for (let i = 0; i < self.myOffers.length; i++) {
        self.newPosts.push(self.myOffers[i].listingID)
      }
      self.postIDs = newPosts;
    }
  });

  this.helpers({
    listings: () => Listings.find({
        _id: { $in: self.getReactively('postIDs', true) },
        active: true
      },{
        limit: self.getReactively('limit'),
        sort: { postDate: -1 }
    }),
    myOffers: () =>  Offers.find({
         offerBy: Meteor.userId()
      },{
        sort: { offerDate: -1 },
        limit: self.loaded
    })
  });

  //Get image of this listing.
  this.upload = function(id) {
    return Uploads.findOne({ listID: id });
  };

  //Get offers of this listing.
  this.offer = function(id) {
    if ( Offers.find({ listingID: id }) ) {
      return Offers.findOne({
          listingID: id
        },{
          sort: {
            offerAmount: -1,
            offerDate: 1
          }
        });
    }
    else {
      return false;
    }
  };

  //Go to Product Page of listing.
  this.go = function(id) {
    $state.go('app.product', { listingId: id });
  };

  //Infinite scroll function.
  $scope.loadMore = function() {
    $timeout( function(){
      if ( (self.options.loaded + 5) > 50 ) {
        self.options.loaded = 50;
      } else {
        self.options.loaded += 5;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }, 2000);
  };

  //Refresher function.
  $scope.refresh = function() {
    self.options.skip = 0;
    self.options.loaded = 10;
    $state.reload('app.myoffers');
    $scope.$broadcast('scroll.refreshComplete');
  };

  //Pagination Back Button.
  this.back = function() {
    $rootScope.$broadcast('loadspinner');
    self.options.loaded = 10;
    if ( self.options.skip !== 0 ) {
      self.options.skip -= 50;
    }
    self.paginate = false;
    $ionicScrollDelegate.scrollTop();
  };

  //Pagination Forward Button.
  this.next = function() {
    $rootScope.$broadcast('loadspinner');
    self.options.loaded = 10;
    self.options.skip += 50;
    self.paginate = false;
    $ionicScrollDelegate.scrollTop();
  };

  this.isSeller = $state.is('app.sell');

  this.noPosts = "You have no pending offers.";

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    if ( !document.getElementById("content-main") ) {
      $rootScope.$broadcast('loadspinner');
    }
  });

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
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

  //$scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    //Hide Ad on on leave.
    //if (Meteor.isCordova && AdMob) {
    //  AdMob.hideBanner();
    //} else {
    //  return;
    //}
  //});
};
