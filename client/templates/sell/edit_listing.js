import { _meteorAngular } from 'meteor/angular';
import { Meteor } from 'meteor/meteor';

angular
    .module('salephone')
    .controller('EditCtrl', EditCtrl);

function EditCtrl ($scope, $stateParams, $reactive, $ionicModal, $state, $rootScope, $ionicLoading) {
  $reactive(this).attach($scope);
  var self = this;

  //Array variables for image upload and preview function.
  self.preview = [];
  self.uploads = [];
  self.removeUploaded = [];
  self.imgSelect = [];
  $scope.newImg = '';

  self.isApp = Meteor.isCordova;

  this.subscribe('productSeller', () => [ $stateParams.listingId ], {
    onReady: function() {
      self.subscribe('product', () => [ self.getReactively('post.productID') ], {
        onReady: function() {
          return;
        }
      });
      $ionicLoading.hide();
    }
  });

  this.autorun( () => {
    //Get listing data to be editted, and detect changes.
    if( self.getCollectionReactively('post') ) {
      self.postNotes = self.post.listingNotes.replace(/<br\s*[\/]?>/g, "\n");
      self.price = self.post.sellPrice.toString();

      if ( self.post.condition != 'New') {
        self.used = self.post.condition.slice(5, self.post.condition.length);
        self.condition = 'Used';
      }
      else {
        self.used='';
        self.condition = 'New';
      }
      if ( self.post.images.length !== 0 && self.preview.length === 0 && self.uploads.length === 0  && self.removeUploaded.length === 0 ) {
        for (let i = 0; i < self.post.images.length; i++) {
          self.preview.push({
            id: self.post.images[i],
            url: null
          });
          self.uploads.push({
            file: self.post.images[i],
            uploaded: true
          });
        }
      }
    }
  });

  this.helpers({
    post: () => Listings.findOne({ _id: $stateParams.listingId }),
    product: () => Products.findOne({ _id: self.getReactively('post.productID') })
  });

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

  this.addImg = function(files) {
    if (self.uploads.length < 4 ) {
      if (files[0]) {
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
      let prevImg = {
        id: null,
        url: $scope.croppedImg
      }
      self.preview.push( prevImg );

      let uploadImg = {
        file: MeteorCameraUI.dataURIToBlob($scope.croppedImg),
        uploaded: false
      }
      self.uploads.push( uploadImg );

      $scope.newImg = '';
      $scope.croppedImg = '';
      $scope.imgCrop.hide();
      $('#newUpload').cropper('destroy');
    }
    else {
      console.log("Error saving image.");
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

  //Show current images in database.
  this.uploadedPreview = function(imgId) {
    return Uploads.findOne({ _id: imgId });
  };

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
      if ( self.preview[ self.imgSelect[i] ].id != null ) {
        self.removeUploaded.push( self.preview[ self.imgSelect[i] ].id )
      }
      self.preview.splice( self.imgSelect[i], 1 );
      self.uploads.splice( self.imgSelect[i], 1 );
    };
      self.imgSelect = [];
  };

  //Variables for form validation.
  self.noPrice = false;
  self.noLocation = false;
  self.noCond = false;
  self.noUpload = false;
  self.noTitle = false;

  //Save changes in listing.
  this.updatePost = function() {
    //Form validation functions.
    if( !self.price ||
        !self.post.meetLocation ||
        !self.condition ||
        isNaN( self.price.replace(/,/g, '') ) === true ||
        self.uploads.length === 0 ||
        ( !self.post.title )
    ){
      if (Meteor.isCordova) {
        $cordovaToast.showLongBottom('Please fill-up all required fields.');
      } else {
        toastr.error('Please fill-up all required fields.');
      }
      if ( !self.price || isNaN( self.price.replace(/,/g, '') ) === true ) { self.noPrice = true; } else { self.noPrice = false; }
      if ( !self.post.meetLocation ) { self.noLocation = true; } else { self.noLocation = false; }
      if ( !self.condition ) { self.noCond = true; } else { self.noCond = false; }
      if ( !self.post.title ) { self.noTitle = true; } else { self.noTitle = false; }
      if ( self.uploads.length === 0 ) { self.noUpload = true; } else { self.noUpload = false; }
    }
    else {
      $rootScope.$broadcast('loadspinner');

      //Delete images selected for removal from database.
      for (let i = 0; i < self.removeUploaded.length; i++) {
        //Method is located at tapshop/lib/methods/listings.js
        Meteor.call('removeUpload', self.post._id, self.removeUploaded[i], function(err) {
          if (err) {
            console.log("Failed to remove image.");
            if (Meteor.isCordova) {
              $cordovaToast.showLongBottom('Error. Please try again.');
            } else {
              toastr.error('Error. Please try again.');
            }
            $ionicLoading.hide();
            return;
          }
        });
      }
      //Save form data to object.
      var updateListing = {
        title: self.post.title,
        sellPrice: parseInt( self.price.replace(/,/g, '') ),
        condition: self.condition.toString(),
        meetLocation: self.post.meetLocation.toString(),
        listingNotes: self.postNotes.toString().replace(/(?:\r\n|\r|\n)/g, '<br />')
      };

      //Insert to form data to database.
      //Method is located at tapshop/server/methods/listings_server.js
      Meteor.call('updateListing', self.post._id, self.post.productID, updateListing, function(err) {
        if (!err) {
          if ( Offers.find({ listingID: self.post._id }).count() != 0 ){
            Offers.find({ listingID: self.post._id }).forEach( function(thisoffer) {
              //Method is located at tapshop/server/methods/feed_server.js
              Meteor.call('insertFeed', 'updatePost', thisoffer.offerBy, self.post.title, self.post._id, function(){
                if (err){
                  if (Meteor.isCordova) {
                    $cordovaToast.showLongBottom('Error. Please try again.');
                  } else {
                    toastr.error('Error. Please try again.');
                  }
                  $ionicLoading.hide();
                }
              });
            });
          }
          //Upload new images to database.
          if ( self.uploads.length !== 0 ){
            let uploadCount = 0;
            self.uploads.forEach( function(imgFile) {
              if ( imgFile.uploaded === false ) {
                self.readFile(imgFile.file, (data) => {
                  let file = {
                    name: self.post.title,
                    size: imgFile.file.size,
                    type: imgFile.file.type,
                    listID: self.post._id
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
                        if (Meteor.isCordova) {
                          $cordovaToast.showShortBottom('Post Updated');
                        } else {
                          toastr.success('Post Updated');
                        }
                        $state.go('app.myproduct', { listingId: self.post._id });
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
              }
              else {
                uploadCount++;
                if (uploadCount === self.uploads.length) {
                  if (Meteor.isCordova) {
                    $cordovaToast.showShortBottom('Post Updated');
                  } else {
                    toastr.success('Post Updated');
                  }
                  $state.go('app.myproduct', { listingId: self.post._id });
                } else {
                    return;
                }
              }
            });
          }
        } else {
          if (Meteor.isCordova) {
            $cordovaToast.showLongBottom('Error. Please try again.');
          } else {
            toastr.error('Error. Please try again.');
          }
          $ionicLoading.hide();
        }
      });
    }
  };

  //Cancel changes.
  this.cancel = function() {
    $scope.imgCrop.remove();
    $state.go('app.myproduct', { listingId: $stateParams.listingId });
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
    if ( document.getElementById("content-main") !== null ) {
      $ionicLoading.hide();
    }
  });
  $scope.$on('$ionicView.beforeLeave', function (event, viewData) {
    $scope.imgCrop.remove();
    $('#newUpload').cropper('destroy');
  });
};
