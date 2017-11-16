'use strict';
var angular = require('angular');

require('../resources/reports.js');

function ReportProblemController ($injector, $stateParams) {
  var $modal = $injector.get('$modal');
  var $uploadImage = $injector.get('$uploadImage');
  var $settings = $injector.get('$settings');
  var $window = $injector.get('$window');
  var $ionicHistory = $injector.get('$ionicHistory');
  var Reports = $injector.get('Reports');

  this.model = {
    bookingId: $stateParams.id,
    buttonActive: false,
    files: []
  };

  // $modal('result', {
  //   message: 'Does the problem keep you from driving?',
  //   title: 'Report a problem',
  //   icon: 'waivecar-mark',
  //   actions: [{
  //     className: 'button-balanced',
  //     text: 'Yes',
  //     handler: function () {
  //       self.important = true;
  //       self.modal.hide();
  //     }
  //   }, {
  //     className: 'button-balanced',
  //     text: 'No',
  //     handler: function () {
  //       self.important = false;
  //       self.modal.hide();
  //     }
  //   }]
  // }).then(function (_modal) {
  //   this.modal = _modal;
  //   this.modal.show();
  // }.bind(this));

  this.submit = function submit () {
    this.model.buttonActive = true;
    Reports.create({
      bookingId: this.model.bookingId,
      description: this.model.comment,
      files: this.model.files
    }).$promise
    .then(successModal)
    .catch(failModal);
  };

  function successModal () {
    this.model.buttonActive = false;
    var modal;
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

  this.addPicture = function addPicture () {
    $uploadImage({
      endpoint: '/files?bookingId=' + $stateParams.id,
      filename: 'problem_' + $stateParams.id + '_' + Date.now() + '.jpg',
    })
    .then(function (result) {
      if (result) {
        if (Array.isArray(result)) {
          var results = result.map(prepareResult);
          this.model.files = this.model.files.concat(results);
        } else {
          this.model.files.push(prepareResult(result));
        }
      }
    }.bind(this))
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
      failModal(message);
    });
  };

  function failModal (message) {
    this.model.buttonActive = false;
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'We couldn\'t report your problem.',
      message: (message || 'The server is down') + '. If the problem persists call us at ' + $settings.phone,
      actions: [{
        text: 'Retry',
        className: 'button-balanced',
        handler: function () {
          modal.remove();
        }
      }, {
        text: 'Cancel',
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
    file.style = {
      'background-image': 'url(' + $settings.uri.api + '/file/' + file.id + ')'
    };
    return file;
  }

}

module.exports = angular.module('app.controllers').controller('ReportProblemController', [
  '$injector',
  '$stateParams',
  ReportProblemController
]);
