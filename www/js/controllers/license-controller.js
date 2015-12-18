'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/upload-image-service');

function LicenseController ($stateParams, $injector) {
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var USStates = $injector.get('USStates');
  var $timeout = $injector.get('$timeout');
  var $state = $injector.get('$state');
  var $uploadImage = $injector.get('$uploadImage');
  var $modal = $injector.get('$modal');
  var $q = $injector.get('$q');

  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;
  this.license = this.license || {};
  this.states = USStates;

  this.nextState = function nextState () {
    $state.go('credit-cards-new', {step: 4});
  };

  var self = this;
  var modal;

  this.pickImage = function pickImage () {
    $uploadImage({
      endpoint: '/files',
      filename: $auth.token.token.substr(0, 10) + '_license.jpg'
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
      return $modal('result', {
        icon: 'check-icon',
        title: 'License Uploaded'
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
        hideModal();
        self.nextState();
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
      $q.reject(err);
    });
  };

  function hideModal () {
    if (modal) {
      modal.remove();
    }
  }

}

module.exports = angular.module('app.controllers').controller('LicenseController', [
  '$stateParams',
  '$injector',
  LicenseController
]);
