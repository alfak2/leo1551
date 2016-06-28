import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('PostCtrl', PostCtrl);

function PostCtrl(
                  $scope,
                  $stateParams,
                  $reactive,
                  $cordovaToast,
                  $ionicModal,
                  $state,
                  $rootScope,
                  $ionicLoading,
                  $ionicPopup
                ) {
  $reactive(this).attach($scope);
  var self = this;

  this.subscribe('product', () => [ $stateParams.productId ], {
    onReady: function() { return; }
  });

  this.helpers({
    product: () => Products.findOne({ _id: $stateParams.productId })
  });

  self.notes='';

  //Array variables for image upload and preview function.
  self.preview = [];
  self.uploads = [];
  self.imgSelect = [];
  $scope.newImg = '';

  self.isApp = Meteor.isCordova;

  if (Meteor.isCordova) {
    //If its a mobile app, ask if image is from camera or files.
    this.setOptions = function() {
      var optionsPopup = $ionicPopup.confirm({
        title: 'Add photos from:',
        scope: $scope,
        buttons: [{
          text: '<i class="fa fa-folder-o"></i> Files',
          type: 'button-stable',
          onTap: function() {
            self.uploadOption = 'Files';
          }
        },{
          text: '<i class="fa fa-camera"></i> Camera',
          type: 'button-stable',
          onTap: function() {
            self.uploadOption = 'Camera';
          }
        }]
      });
    };

    //Upload image from camera or files.
    this.addCamera = function() {
      if (self.uploads.length < 4 ) {
        MeteorCameraUI.getPictureNoUI({ quality: 100 }, function(error, data){
          if (data) {
            $scope.newImg = data;
            //Load image cropper.
            $scope.imgCrop.show();
            angular.element(document.querySelector('#newUpload')).on('load', function() {
              $('#newUpload').cropper({
                aspectRatio: 1/1,
                dragMode: 'move',
                rotatable: true,
                movable: true,
                responsive: false,
                toggleDragModeOnDblclick: false,
                minContainerHeight: 500,
                minCropBoxWidth: 50,
                minCropBoxHeight: 50,
                built: function(e) {
                  $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                },
                cropend: function(e) {
                  $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
                }
              })
            });
          }
        });
      }
      else {
        $cordovaToast.showShortBottom('Too many uploads.');
      }
    };
  };

  //Upload image from file.
  this.addImg = function(files) {
    if (self.uploads.length < 4 ) {
      if (files[0]) {
        //Load image cropper.
        $scope.imgCrop.show();
        $scope.newImg = window.URL.createObjectURL(files[0]);
        angular.element(document.querySelector('#newUpload')).on('load', function() {
          $('#newUpload').cropper({
            aspectRatio: 1/1,
            dragMode: 'move',
            rotatable: true,
            movable: true,
            responsive: false,
            toggleDragModeOnDblclick: false,
            minContainerHeight: 500,
            minCropBoxWidth: 50,
            minCropBoxHeight: 50,
            built: function(e) {
              $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
            },
            cropend: function(e) {
              $scope.croppedImg = $(this).cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
            }
          })
        })
      }
      else {
        $scope.newImg = '';
      }
    }
    else {
      if (Meteor.isCordova) {
        $cordovaToast.showShortBottom('Too many uploads.');
      } else {
        toastr.error('Too many uploads.');
      }
    }
  };

  //Rotate Image
  $scope.rotate = function() {
    $('#newUpload').cropper('rotate', 90);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  //Zoom Image
  $scope.zoomIn = function() {
    $('#newUpload').cropper('zoom', 0.1);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  $scope.zoomOut = function() {
    $('#newUpload').cropper('zoom', -0.1);
    $scope.croppedImg = $('#newUpload').cropper('getCroppedCanvas', { width: 500, height: 500 }).toDataURL("image/jpeg", 1.0);
  }

  //Save cropped image to array.
  $scope.uploadImg = function() {
    if ($scope.croppedImg) {
      let saveUpload = MeteorCameraUI.dataURIToBlob($scope.croppedImg);
      self.preview.push($scope.croppedImg);
      self.uploads.push(saveUpload);

      $scope.newImg = '';
      $scope.croppedImg = '';
      $scope.imgCrop.hide();
      $('#newUpload').cropper('destroy');
    }
    else {
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Error. Please try again.');
      } else {
        toastr.error('Error. Please try again.');
      }
      $scope.newImg = '';
      $scope.croppedImg = '';
      $scope.imgCrop.hide();
      $('#newUpload').cropper('destroy');
    }
  };

  //Cancel image upload.
  $scope.cancelImg = function() {
    $scope.imgCrop.hide();
    $scope.newImg = '';
    $scope.croppedImg = '';
    $('#newUpload').cropper('destroy');
  };

  //Image cropper canvas.
  $ionicModal.fromTemplateUrl('client/templates/sell/components/img_crop.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.imgCrop = modal;
  });

  //Function for selecting uploaded image.
  this.selectImg = function(select) {
    if ( self.imgSelect.length  === 0 ) {
      self.imgSelect.push(select);
    }
    else {
      let images = self.imgSelect;
      let selected = false;
      images.forEach(function(img){
        if (select === img) {
          let index = images.indexOf(select);
          images.splice(index, 1);
          return selected = true;
        }
      });
      if (selected === false) {
        images.push(select);
      }
      self.imgSelect = images;
    }
  };

  //Remove selected image.
  this.removeUpload = function() {
    for (let i = 0; i < self.imgSelect.length; i++) {
      self.preview.splice( self.imgSelect[i], 1 );
      self.uploads.splice( self.imgSelect[i], 1 );
    };
    self.imgSelect = [];
  };

  //Variables for form validation.
  $scope.noPrice = false;
  $scope.noLocation = false;
  $scope.noCond = false;
  $scope.noUpload = false;
  $scope.noTitle = false;

  //Upload new listing.
  this.submitPost = function() {
    Session.set('init', true);
    let product = Products.findOne({_id: $stateParams.productId});
    //Form validation functions.
    if(
        !this.price ||
        !this.location ||
        !this.condition ||
        isNaN( this.price.replace(/,/g, '') ) === true ||
        self.uploads.length === 0 ||
        !this.listingTitle
    ){
      console.log("Please fill-up all required items.")
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Please fill-up all required items.');
      } else {
        toastr.error('Please fill-up all required items.');
      }
      if ( !this.price || isNaN( this.price.replace(/,/g, '') ) === true ) { $scope.noPrice = true; } else { $scope.noPrice = false; }
      if (!this.location) { $scope.noLocation = true; } else { $scope.noLocation = false; }
      if (!this.condition) { $scope.noCond = true; } else { $scope.noCond = false; }
      if ( !this.listingTitle ) { $scope.noTitle = true; } else { $scope.noTitle = false; }
      if ( self.uploads.length === 0 ) { $scope.noUpload = true; } else { $scope.noUpload = false; }
    }
    else {
      $rootScope.$broadcast('loadspinner');

      let uploads = self.uploads;

      //Save form data to object.
      var newListing = {
        productID: product._id,
        title: this.listingTitle,
        sellPrice: parseInt( this.price.replace(/,/g, '') ),
        condition: this.condition.toString(),
        meetLocation: this.location.toString(),
        listingNotes: self.notes.toString().replace(/(?:\r\n|\r|\n)/g, '<br />')
      };
      //Insert to form data to database.
      //Method is located at tapshop/server/methods/listings_server.js
      Meteor.call('postListing', newListing, function(err, posted) {
        if (!err) {
          let uploadCount = 0;
          //Upload images to database.
          self.uploads.forEach( function(imgFile) {
            self.readFile(imgFile, (data) => {
              let file = {
                name: self.listingTitle,
                size: imgFile.size,
                type: imgFile.type,
                listID: posted
              }
              let upload = new UploadFS.Uploader({
                store: UploadStore,
                adaptive: false,
                data: data,
                file: file,
                onCreate: function (uploaded) {
                  Meteor.call('insertImage', uploaded.listID, uploaded._id);
                },
                onComplete: function(){
                  uploadCount++;
                  if (uploadCount === self.uploads.length) {
                    //Insert test data. Please remove when deoploying for production.
                    if ( Meteor.isDevelopment ) {
                      //Method is located at tapshop/server/test_data/seed_methods.js
                      Meteor.call('seed', posted)
                    }
                    $state.go('app.sell');
                  } else {
                    return;
                  }
                },
                onError: function (err) {
                  console.log("Upload Error");
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Error. Please try again.');
                  } else {
                    toastr.error('Error. Please try again.');
                  }
                  $ionicLoading.hide();
                  return;
                },
              });
              upload.start();
            });
          });
        }
        else {
          $ionicLoading.hide();
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } else {
            toastr.error('Error. Please try again.');
          }
        }
      });
    }
  };

  //Cancel new listing.
  this.cancel = function() {
    $scope.imgCrop.remove();
    $state.go('app.select');
  };

  this.readFile = function(blob, callback, errorCallback) {
    const reader = new FileReader();

    reader.onload = (e) => {
      callback(e.target.result);
    };

    reader.onerror = (e) => {
      if (errorCallback) {
        errorCallback(e);
      }
    };
    reader.readAsArrayBuffer(blob);
  };

  $scope.$on('$ionicView.afterEnter', function (event, viewData) {
    $ionicLoading.hide();
  });

  $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    $scope.imgCrop.remove();
    $('#newUpload').cropper('destroy');
  });
};
