import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('AuthCtrl', AuthCtrl);

 function AuthCtrl ($scope, $reactive, $state, $ionicLoading, $ionicHistory) {
    $reactive(this).attach($scope);
    AccountsTemplates.setState("changePwd");

    //Method is located at tapshop/server/methods/profile_server.js
    Meteor.call('hasPassword', function(err, result){
      if ( err || result === false ){
        $ionicHistory.goBack();
      }
    });

    $scope.$on('$ionicView.afterEnter', function () {
        $ionicLoading.hide();
    });
 };
