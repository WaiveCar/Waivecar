'use strict';
var angular = require('angular');
var _ = require('lodash');
require('angular-ui-router');
require('../services/data-service');

module.exports = angular.module('app.controllers').controller('VerifyIdController', [
  '$scope',
  '$settings',
  '$window',
  '$stateParams',
  '$ionicLoading',
  '$injector',
  function($scope, $settings, $window, $stateParams, $ionicLoading, $injector) {
    var $uploadImage = $injector.get('$uploadImage');
  
    var $timeout = $injector.get('$timeout');
    var $modal = $injector.get('$modal');
    var $message = $injector.get('$message');
    var $data = $injector.get('$data');
    var $q = $injector.get('$q');

    var ctrl = this;

    ctrl.imageMap = {
      license: '/img/camera.svg',
      selfie: '/img/camera.svg'
    };

    this.submit = function submit () {
      return this.license.$create()
      .then(function () {
        var modal;
        return $modal('result', {
          icon: 'check-icon',
          title: 'License info received',
          message: 'Thanks! During normal business hours this will only take a minute or two.'
        })
        .then(function (_modal) {
          modal = _modal;
          modal.show();
          return modal;
        })
        .then(function () {
          return $timeout(1000);
        })
        .then(function () {
          modal.remove();
        });
      })
      .catch(function onUploadFailed (err) {
        var message = 'Looks like the formatting of your license is wrong, please try again.';
        if('data' in err && 'message' in err.data) {
          message = err.data.message;
        }
        submitFailure(message);
        $q.reject(err);
      });
    };

    function addPicture (param, value, what) {
      $uploadImage({
        endpoint: '/files?' + param + value,
        filename: [what, value, Date.now()].join('_') + '.jpg',
        sourceList: ['camera']
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];

        ctrl.imageMap[what] = $settings.uri.api + '/file/' + result.id;
      })
      .catch(function (err) {
        var message = err.message;
        if (err instanceof $window.FileTransferError) {
          if (err.body) {
            var error = angular.fromJson(err.body);
            if (error.message) {
              message = error.message;
            }
          }
        }
        submitFailure(message);
      });
    };

    ctrl.addLicense = function () {
      addPicture('licenseId=', $scope.license.id, 'license');
    };

    ctrl.addSelfie = function () {
      addPicture('isAvatar=true&userId=', $scope.user.id, 'selfie');
    };

    function updateImages() {
      if($scope.user.avatar) {
        ctrl.imageMap.selfie = $settings.uri.api + '/file/' + $scope.user.avatar;
      }

      if($scope.license && $scope.license.fileId) {
        ctrl.imageMap.license = $settings.uri.api + '/file/' + $scope.license.fileId;
      }
    }

    $scope.init = function() {

      // this insane thingie is how licenses for a user are found.are detected.
      return $data.resources.users.me().$promise
        .then(function(me) {
          $scope.user = me;
          return $data.resources.licenses.query().$promise;
        }).then(function(licenses) {
          $scope.license = _(licenses)
            .filter({userId: $scope.user.id})
            .sortBy('createdAt')
            .last();
          console.log($scope);
          updateImages();
        }).catch($message.error);
    };

    $scope.init();


    function submitFailure(message) {
      $ionicLoading.hide();
      var uploadError;

      $modal('result', {
        icon: 'x-icon',
        title: message,
        actions: [{
          text: 'Retry',
          className: 'button-balanced',
          handler: function () {
            uploadError.remove();
          }
        }]
      })
      .then(function (_modal) {
        _modal.show();
        uploadError = _modal;
      });
    }
  }
]);
