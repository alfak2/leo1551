import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('SelectCtrl', SelectCtrl);

 function SelectCtrl (
                      $scope,
                      $state,
                      $reactive,
                      $rootScope,
                      $ionicLoading,
                      $ionicPlatform,
                      $ionicHistory,
                      $ionicViewSwitcher,
                      $cordovaDevice,
                      $ionicScrollDelegate,
                      $timeout
                    ){
    $reactive(this).attach($scope);
    var self = this;

    //Varianles for infinite scroll.
    self.limit = 20;
    self.loaded = self.limit;

    //Method is located at tapshop/lib/methods/app_methods.js
    Meteor.call('allProducts', function(err, count){
      if (!err){
        self.allproducts = count;
      }
    })

    this.subscribe('selectModel', () => [ self.getReactively('limit') ], {
      onReady: function() {
        self.loaded = self.limit;
        $ionicLoading.hide();
        return;
      }
    })

    this.helpers({
        products() {
          return Products.find({},{
            sort: {
              name: 1
            },
            limit: self.getReactively('loaded') });
        },
        isLoading() { return Search.getStatus().loading }
    });

    //Infinite scroll function.
    $scope.loadMore = function() {
        $timeout( function(){
          self.limit += 10;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }, 2000);
    };

    $ionicPlatform.onHardwareBackButton( function(){
      if ( $ionicHistory.backView() === null ) {
        $ionicViewSwitcher.nextDirection("back");
        $state.go('app.shop');
      }
    });

    $scope.$on('$ionicView.afterEnter', function (event, viewData) {
      if ( document.getElementById("content-main") !== null ) {
        $ionicLoading.hide();
      }
    });
};
