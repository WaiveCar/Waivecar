'use strict';

var angular = require('angular');
var ionic = require('ionic');

require('./camera-service');

// The options are:
//
//  endpoint - where the file will be saved
//  filename - what the file will be called
//  sourceList (optional) - an array of sources to accept from.
//     The default value (through omission) is "all" which 
//     is equivalent to whateve is set at the beginning of
//     pickImageSource() below.
//
function uploadImageFactory ($injector) {
  var $modal = $injector.get('$modal');
  var $auth = $injector.get('$auth');
  var $cordovaFileTransfer = $injector.get('$cordovaFileTransfer');
  var $settings = $injector.get('$settings');
  var $q = $injector.get('$q');
  var $ionicActionSheet = $injector.get('$ionicActionSheet');
  var $timeout = $injector.get('$timeout');
  var CameraService = $injector.get('CameraService');
  var $cordovaCamera = $injector.get('$cordovaCamera');

  var buttons = [
    { text: 'Take Photo…' },
    { text: 'Choose from Library' }
  ];

  if (!ionic.Platform.isWebView()) {
    buttons.push({ text: 'Skip Photo (web)' });
  }

  return function uploadImage (options) {
    options = options || {};
    return pickImageSource(options)
      .then(function (source) {
        if (source === 'library') {
          return CameraService.pickFile();
        } else if (source === 'camera') {
          return CameraService.getPicture();
        } else {
          return null;
        }
      })
      .then(upload(options));
  };

  function upload (options) {
    return function (fileUri) {
      if (fileUri == null) {
        return null;
      }
      var modal;
      return showLoadingModal()
      .then(function (_modal) {
        modal = _modal;
        return transferPicture(options, fileUri);
      })
      .finally(function () {
        if (modal) {
          modal.remove();
        }
      });
    };
  };

  function pickImageSource (optionMap) {
    optionMap.sourceList = optionMap.sourceList || ['camera', 'library'];

    // Only show the dialog box if the upload cna come from multiple places.
    if(optionMap.sourceList.length > 1) {
      var hideSheet;
      return $q(function (done) {
        hideSheet = $ionicActionSheet.show({
          buttons: buttons,
          cancelText: 'Cancel',
          buttonClicked: done
        });
      })
      .then(function onSourceSelected (buttonIndex) {
        if (typeof hideSheet === 'function') {
          hideSheet();
          hideSheet = null;
        }
        if (buttonIndex === 2) {
          return $timeout(500)
            .then(function () {
              return null;
            });
        } else if (buttonIndex === 0) {
          return 'camera';
        } else if (buttonIndex === 1) {
          return 'library';
        }
        return null;
      });
    } else {
      return $q(function (done) {
        done();
      }).then(function(){
        return optionMap.sourceList[0];
      });
    }
  };

  function showLoadingModal () {
    return $modal('result', {
      title: 'Uploading image',
      icon: '/templates/modals/loader.html'
    })
    .then(function (modal) {
      modal.show();
      return modal;
    });
  }

  function transferPicture (opts, filePath) {
    if (!opts.endpoint) {
      throw new Error('expecting endpoint in options');
    }
    if (opts.endpoint.indexOf($settings.uri.api) === -1) {
      opts.endpoint = $settings.uri.api + opts.endpoint;
    }

    var options = {
      headers: {
        Connection: 'close',
        Authorization: $auth.token.token
      },
      fileKey: 'files',
      fileName: opts.filename,
      mimeType: 'image/jpeg',
    };

    if (opts.params) {
      options.params = opts.params;
    }

    return $cordovaFileTransfer.upload(opts.endpoint, filePath, options, true)
      .then(function (response) {
        if (response && response.responseCode === 200){
          response = angular.fromJson(response.response);
        }
        return response;
      })
      .finally(function () {
        $cordovaCamera.cleanup();
      });
  }

}

module.exports = angular.module('app.controllers').factory('$uploadImage', [
  '$injector',
  uploadImageFactory
]);
