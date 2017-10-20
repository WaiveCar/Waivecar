'use strict';
var angular = require('angular');


function DamageGalleryController ($injector, $stateParams) {

  var $uploadImage = $injector.get('$uploadImage');
  var $settings = $injector.get('$settings');
  var $ionicHistory = $injector.get('$ionicHistory');
  var Reports = $injector.get('Reports');
  var $data = $injector.get('$data');
  var $state = $injector.get('$state');

  var ctrl = this;
  ctrl.images = [];

  Reports.carReports({id : $data.active.cars.id}).$promise.then(
    function(reports) {

      ctrl.images = reports.reduce( function(result,  report) {
        return result.concat(report.files.map(function(file) {
          return {
            description: report.description,
            url: $settings.uri.api + '/file/' + file.fileId
          }
        }))
      }, []);
    }
  );

  this.addPicture = function addPicture () {
    $uploadImage({
      endpoint: '/files?bookingId=' + $stateParams.id,
      filename: 'problem_' + $stateParams.id + '_' + Date.now() + '.jpg',
    })
    .then(function (result) {
      if (result) {
        if (Array.isArray(result)) {
          if (result.length > 0) {
            result = result[0];
          }
        }
      }
      if (result) {
        $data.active.damagePhoto = result;
        $state.go('report-problem', $stateParams, { location: 'replace' });
      }
    }.bind(this))
    .catch(function (err) {
      var message = err.message;
      /*if (err instanceof $window.FileTransferError) {
        if (err.body) {
          var error = angular.fromJson(err.body);
          if (error.message) {
            message = error.message;
          }
        }
      }*/
      failModal(message);
    });
  };

  function failModal (message) {
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'We couldn\'t report your problem.',
      message: (message || 'The server is down') + '. If the problem persists call us at ' + $settings.phone,
      actions: [{
        text: 'Ok',
        className: 'button-dark',
        handler: function () {
          modal.remove();
        }
      }]
    })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
      });
  }


  this.goBack = function() {
    $ionicHistory.goBack();
  };


}

module.exports = angular.module('app.controllers').controller('DamageGalleryController', [
  '$injector',
  '$stateParams',
  DamageGalleryController
]);
