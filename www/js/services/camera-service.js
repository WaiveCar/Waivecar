angular.module('app.services').factory('CameraService', [
  '$cordovaCamera',
  '$q',
  '$config',
  '$window',
  function ($cordovaCamera, $q, $config, $window) {
    'use strict';

    var fileUploadURL = $config.uri.api + '/files/local';

    function getPicture(width, height, upload) {
      console.log('$window.Camera', JSON.stringify(window.Camera));
      // console.log('navigator.Camera', window.Camera, navigator.Camera, navigator.camera, window.cordova);

      if (!$window.Camera) {
        return $q.reject('This feature works only on mobile');
      }

      var sourceType = $window.Camera.PictureSourceType.CAMERA;
      if (upload) {
        sourceType = $window.Camera.PictureSourceType.PHOTOLIBRARY;
      }

      var options = {
        quality: 75,
        destinationType: $window.Camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        encodingType: $window.Camera.EncodingType.JPEG,
        targetWidth: width || 800,
        targetHeight: height || 800,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        cameraDirection: $window.Camera.Direction.BACK
      };

      return $cordovaCamera.getPicture(options);

    }

    function uploadFile(width, height) {
      return getPicture(width, height, true);
    }

    function savePicture(fileUri) {
      var options = new $window.FileUploadOptions();
      options.headers = {
        Connection: 'close'
      };
      options.fileKey = 'files';
      // options.fileName = fileUri.substr(fileUri.lastIndexOf('/') + 1);
      options.fileName = 'license';
      options.mimeType = 'image/jpeg';
      options.withCredentials = true;

      // fileUri = $window.FileEntry.toURL(fileUri);
      // console.log('Uploading', fileUri, 'with', JSON.stringify(options), fileUploadURL);

      var ft = new $window.FileTransfer();

      var defered = $q.defer();

      var successCb = function (response) {
        console.log('File upload success', JSON.stringify(response));
        return $cordovaCamera.cleanup()
          .then(function () {
            defered.resolve(response);
          });

      };

      var errorCb = function (response) {
        console.log('File upload error', JSON.stringify(response));
        defered.reject(response);
      };

      ft.upload(fileUri, encodeURI(fileUploadURL), successCb, errorCb, options, true);

      return defered.promise;

    }

    return {
      getPicture: getPicture,
      savePicture: savePicture,
      uploadFile: uploadFile
    };

  }
]);
