'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('CameraService', [
  '$cordovaCamera',
  '$q',
  '$settings',
  '$window',
  '$auth',
  function ($cordovaCamera, $q, $settings, $window, $auth) {

    var fileUploadURL = $settings.uri.api + '/files';

    function getPicture(width, height, upload) {

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

    function pickFile(width, height) {
      return getPicture(width, height, true);
    }

    function uploadPicture(fileUri) {
      var options = new $window.FileUploadOptions();
      options.headers = {
        Connection: 'close',
        Authorization: $auth.token.token
      };
      options.fileKey = 'files';
      // options.fileName = fileUri.substr(fileUri.lastIndexOf('/') + 1);
      options.fileName = $auth.token.token.substr(0, 10) + '_license.jpg';
      options.mimeType = 'image/jpeg';

      var ft = new $window.FileTransfer();

      var defered = $q.defer();

      var successCb = function (response) {
        $cordovaCamera.cleanup();
        if(response && response.responseCode === 200){
          response = angular.fromJson(response.response);
        }
        return defered.resolve(response);

      };

      var errorCb = function (response) {
        $cordovaCamera.cleanup();
        return defered.reject(response);

      };

      ft.upload(fileUri, encodeURI(fileUploadURL), successCb, errorCb, options, true);

      return defered.promise;

    }

    return {
      getPicture: getPicture,
      uploadPicture: uploadPicture,
      pickFile: pickFile
    };

  }
]);
