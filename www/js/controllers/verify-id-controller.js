'use strict';
var angular = require('angular');
var _ = require('lodash');
require('angular-ui-router');
require('../services/data-service');

function VerifyIdController($injector, $stateParams, $scope, $settings, $window, $ionicLoading){
  var $uploadImage = $injector.get('$uploadImage');
  var $timeout = $injector.get('$timeout');
  var $modal = $injector.get('$modal');
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $state = $injector.get('$state');

  var ctrl = this;
  var images = ctrl.imageMap = {
    // This is a flag that gets toggled if both
    // types of images have been provided. It
    // enables the button.
    default: 'img/camera.svg'
  };

  ctrl.haveAllImages = function(){
    return (
      (images.license && images.license !== images.default) &&
      (images.selfie && images.selfie !== images.default)
    );
  };

  ctrl.submit = function(form){
    /*if (form.$invalid || !ctrl.haveAllImages()){
      return $message.error('Please fix form errors and try again.');
    }*/
    var modal;
    return $modal('result', {
      icon: 'check-icon',
      title: 'Photographs Sent',
      message: 'Thanks! We appreciate it.'
    })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
        return modal;
      })
      .then(function () {
        return $timeout(2000);
      })
      .then(function () {
        modal.remove();
        if (ctrl.isWizard) {
          return $state.go('credit-cards-new', {step: 5});
        }
        $state.go('users-edit');
      });
  };

  function addPicture(param, value, what){
    $uploadImage({
      endpoint: '/files?' + param + value,
      filename: [what, value, Date.now()].join('_') + '.jpg',
      sourceList: ['camera']
    })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];
        if (result) {
          ctrl.imageMap[what] = $settings.uri.api + '/file/' + result.id;
        }
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

  ctrl.addLicense = function(){
    addPicture('licenseId=', $scope.license.id, 'license');
  };

  ctrl.addSelfie = function(){
    addPicture('isAvatar=true&userId=', $scope.user.id, 'selfie');
  };

  function updateImages(){
    if($scope.user.avatar) {
      ctrl.imageMap.selfie = $settings.uri.api + '/file/' + $scope.user.avatar;
    } else {
      ctrl.imageMap.selfie = ctrl.imageMap.default;
    }

    if($scope.license && $scope.license.fileId) {
      ctrl.imageMap.license = $settings.uri.api + '/file/' + $scope.license.fileId;
    } else {
      ctrl.imageMap.license = ctrl.imageMap.default;
    }
  }

  $scope.init = function(){
    ctrl.isWizard = $stateParams.step;

    // this insane thingie is how licenses for a user are found.
    return $data.resources.users.me().$promise
      .then(function(me) {
        $scope.user = me;
        return $data.resources.licenses.query().$promise;
      }).then(function(licenses) {
        $scope.license = _(licenses)
          .filter({userId: $scope.user.id})
          .sortBy('createdAt')
          .last();

        ctrl.license = $scope.license;
        ctrl.licenseDisplay = true;
        updateImages();
      }).catch($message.error);
  };

  $scope.init();

  function submitFailure(message){
    $ionicLoading.hide();
    var uploadError;

    $modal('result', {
      icon: 'x-icon',
      title: 'Did You Take a Picture?',
      message: 'If you did, please try again. ' + (message || ''),
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

module.exports = angular.module('app.controllers')
  .controller('VerifyIdController', [
    '$injector',
    '$stateParams',
    '$scope',
    '$settings',
    '$window',
    '$ionicLoading',
    VerifyIdController
  ]);
