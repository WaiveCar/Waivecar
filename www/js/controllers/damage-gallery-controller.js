'use strict';
var angular = require('angular');
var moment = require('moment');


function DamageGalleryController ($injector, $stateParams) {

  var $modal = $injector.get('$modal');
  var $uploadImage = $injector.get('$uploadImage');
  var $settings = $injector.get('$settings');
  var $ionicHistory = $injector.get('$ionicHistory');
  var Reports = $injector.get('Reports');
  var $data = $injector.get('$data');
  var $state = $injector.get('$state');
  var $ride = $injector.get('$ride');

  var ctrl = this;
  ctrl.images = null;
  ctrl.car = {};

  ctrl.backCaption = $stateParams.return === 'dashboard' ? 'Start ride' : 'Finish and Lock Car';

  $data.activate('bookings', $stateParams.id).then(function() {
    var carId = $data.active.bookings.carId;

    Reports.carReports({id: carId}).$promise.then(
      function (reports) {

        ctrl.images = reports.reduce(function (result, report) {
          return result.concat(report.files.map(function (file) {
            return {
              description: report.description,
              url: $settings.uri.api + '/file/' + file.fileId,
              created_at: moment(file.created_at)
            };
          }));
        }, []).sort(function(a, b) {
          if (a.created_at < b.created_at) {
            return 1;
          }
          if (a.created_at > b.created_at) {
            return -1;
          }
          return 0;
        });
      }
    );

    $data.activate('cars', carId).then(function(){
      ctrl.car = $data.active.cars;
    });
  });

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
    })
    .catch(function (err) {
      failModal(err.message);
    });
  };

  this.showPicture = function showPicture(image) {
    $data.active.damagePhoto = image;
    $state.go('show-problem', $stateParams);
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
    if ($stateParams.return === 'bookings-show') {
      return $ride.checkAndProcessActionOnBookingEnd();
    } else {
      $state.go($stateParams.return, $stateParams, {location: 'replace'});
    }
  };

}

module.exports = angular.module('app.controllers').controller('DamageGalleryController', [
  '$injector',
  '$stateParams',
  DamageGalleryController
]);
