'use strict';
var angular = require('angular');

require('../resources/reports.js');

function ReportProblemController ($injector, $stateParams) {
  var $modal = $injector.get('$modal');
  var $settings = $injector.get('$settings');
  var $ionicHistory = $injector.get('$ionicHistory');
  var Reports = $injector.get('Reports');
  var $data = $injector.get('$data');
  var ctrl = this;

  this.model = {
    bookingId: $stateParams.id,
    car: $data.active.cars.license,
    buttonActive: false,
    file: prepareResult($data.active.damagePhoto)
  };

  this.submit = function submit () {
    this.model.buttonActive = true;
    Reports.create({
      bookingId: this.model.bookingId,
      description: this.model.comment,
      files: [this.model.file]
    }).$promise
      .then(successModal)
      .catch(failModal);
  };

  function successModal () {
    var modal;

    ctrl.model.buttonActive = false;
    $modal('result', {
      icon: 'check-icon',
      title: 'Success!',
      message: 'If the problem is preventing you from driving call us at ' + $settings.phone,
      actions: [{
        className: 'button-balanced',
        text: 'Continue',
        handler: function () {
          modal.remove();
          $ionicHistory.goBack();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    })
    .catch(function (err) {
      failModal(err.message);
    });
  }

  function failModal (message) {
    var modal;

    ctrl.model.buttonActive = false;
    $modal('result', {
      icon: 'x-icon',
      title: 'We couldn\'t report your problem.',
      message: (message || 'The server is down') + '. If the problem persists call us at ' + $settings.phone,
      actions: [{
        text: 'Ok',
        className: 'button-dark',
        handler: function () {
          modal.remove();
          $ionicHistory.goBack();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  function prepareResult (file) {
    file.url = $settings.uri.api + '/file/' + file.id;
    return file;
  }
}

module.exports = angular.module('app.controllers').controller('ReportProblemController', [
  '$injector',
  '$stateParams',
  ReportProblemController
]);