'use strict';
var angular = require('angular');
var ionic = require('ionic');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/camera-service');

function LicenseController ($stateParams, $injector) {
  var CameraService = $injector.get('CameraService');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var USStates = $injector.get('USStates');
  var $ionicActionSheet = $injector.get('$ionicActionSheet');
  var $q = $injector.get('$q');
  var $modal = $injector.get('$modal');
  var $timeout = $injector.get('$timeout');
  var $state = $injector.get('$state');

  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;
  this.license = this.license || {};
  this.states = USStates;

  this.nextState = function nextState () {
    if (this.isWizard) {
      $state.go('credit-cards-new', {step: 4});
    } else {
      // TODO can something come to this screen after the wizard?
    }
  };

  var self = this;
  var modal;
  function loadingModal () {
    return $modal('result', {
      title: 'Uploading your license',
      icon: '/templates/modals/loader.html'
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  var fileUri;
  function upload (source) {
    if (!fileUri) {
      fileUri = source;
    }
    if (modal) {
      console.error('Modal duplication found');
    }
    loadingModal();
    return CameraService.uploadPicture(fileUri)
    .then(function (response) {
      hideModal();
      return $modal('result', {
        icon: 'check-icon',
        title: 'License Uploaded'
      })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
        return response;
      });
    })
    .catch(function onUploadFailed (err) {
      $modal('result', {
        icon: 'x-icon',
        title: 'Upload failed',
        actions: [{
          className: 'button-balanced',
          text: 'Retry',
          handler: function () {
            hideModal();
            upload();
          }
        }, {
          className: 'button-dark',
          text: 'Skip',
          handler: function () {
            hideModal();
            self.nextState();
          }
        }]
      })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
      });
      throw err;
    });
  }

  function hideModal () {
    if (!modal) {
      return;
    }
    modal.remove();
    modal = null;
  }

  var buttons = [
    { text: 'Take Photo…' },
    { text: 'Choose from Library' }
  ];
  if (!ionic.Platform.isWebView()) {
    buttons.push({ text: 'Skip Photo (web)' });
  }

  this.pickImage = function pickImage () {
    var hideSheet;
    $q(function (done) {
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
        return $q(function (done) {
          $timeout(function () {
            done('foo');
          }, 2000);
        });
      } else if (buttonIndex === 0) {
        return CameraService.getPicture()
          .then(upload);
      } else if (buttonIndex === 1) {
        return CameraService.pickFile()
          .then(upload);
      }
    })
    .then(function onPictureUploaded (uploadResponse) {
      this.license = new $data.resources.licenses({
        number: this.license.number,
        state: this.license.state,
        userId: $auth.me.id,
        country: 'USA'
      });

      if (uploadResponse) {
        if (Array.isArray(uploadResponse) && uploadResponse.length) {
          this.license.fileId = uploadResponse[0].id;
        }
      }

      return this.license.$save();
    }.bind(this))
    .then(function () {
      $timeout(function () {
        hideModal();
        self.nextState();
      }, 1000);
    });
  };

}

module.exports = angular.module('app.controllers').controller('LicenseController', [
  '$stateParams',
  '$injector',
  LicenseController
]);
