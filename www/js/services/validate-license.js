'use strict';
var angular = require('angular');
var _ = require('lodash');

function LicenseValidationService ($injector) {
  var $data = $injector.get('$data');
  var $q = $injector.get('$q');
  var $state = $injector.get('$state');
  var $modal = $injector.get('$modal');
  var $interval = $injector.get('$interval');
  var $ionicHistory = $injector.get('$ionicHistory');
  var $distance = $injector.get('$distance');

  var polling;
  var maxDistance = 30; // at least one car should be less than this distance

  function validate (license) {
    return validateNoDistanceCheck(license);
  }

  function validateNoDistanceCheck (license) {
    return checkLicense(license).catch(function (reason) {
        if (reason && reason.code !== 'VALIDATE') {
          return handleRejection(reason);
        }
        return $data.resources.licenses.verify({
          id: license.id,
          userId: license.userId
        }).$promise
          .then(spinner)
          .then(success)
          .catch(handleRejection);
      });
  }

  function validateWithDistanceCheck (license) {
    return $data.fetch('cars')
      .then(function (instances) {
        var carInRange = _(instances).find(function (car) {
          var distance = $distance(car);
          return _.isFinite(distance) && distance < maxDistance;
        });
        if (carInRange == null) {
          return $q.reject({code: 'NO_RANGE'});
        }
      })
      .then(function () {
        return checkLicense(license);
      })
      .catch(function (reason) {
        if (reason && reason.code === 'NO_RANGE') {
          var modal;
          $modal('simple-modal', {
            title: 'Bummer',
            message: 'We can only validate your license when you\'re close to a WaiveCar. Check back when you are in the area.'
          }).then(function (_modal) {
            modal = _modal;
            modal.show();
          });
          return $q.reject(reason);
        }
        if (reason && reason.code !== 'VALIDATE') {
          return handleRejection(reason);
        }
        return $data.resources.licenses.verify({
          id: license.id,
          userId: license.userId
        }).$promise
          .then(spinner)
          .then(success)
          .catch(handleRejection);
      });
  };

  function checkLicense (license) {
    if (license == null) {
      return $q.reject({code: 'LICENSE_EMPTY'});
    }
    if (license.status === 'pending') {
      return $q.reject({code: 'LICENSE_INCOMPLETE', id: license.id});
    }
    if (license.status === 'in-progress') {
      return $q.reject({code: 'LICENSE_IN_PROGRESS'});
    }
    if (license.status === 'complete') {
      if (license.outcome === 'clear') {
        return $q.resolve();
      }
      if (license.outcome === 'consider') {
        return $q.reject({code: 'LICENSE_MANUAL_CHECK'});//'LICENSE_CONSIDER'});
      }
      if (license.outcome === 'reject') {
        return $q.reject({code: 'LICENSE_FAILED'});
      }
    }
    return $q.reject({code: 'VALIDATE'});
  }

  function handleRejection (reason) {
    switch (reason.code) {
      case 'LICENSE_FAILED':
        failure();
        break;
      case 'LICENSE_EMPTY':
        $state.go('licenses-new');
        break;
      case 'LICENSE_INCOMPLETE':
        $state.go('licenses-edit', {licenseId: reason.id});
        break;
      case 'LICENSE_MANUAL_CHECK':
        manualCheck();
        break;
      default:
        $q.reject(reason);
    }
  }

  function cancelPolling () {
    if (polling == null) {
      return;
    }
    $interval.cancel(polling);
    polling = null;
  };

  function spinner (license) {
    var modal;
    var modalOpts = {
      title: 'Validating your license',
      message: 'Validating usually takes a few minutes. However in some cases it could take up to a business day',
      icon: '/templates/modals/loader.html',
      actions: [{
        text: 'Close',
        className: 'button-dark',
        handler: function () {
          modal.remove();
        }
      }]
    };
    return $modal('result', modalOpts)
    .then(function (_modal) {
      modal = _modal;
      modal.show();

      var count = 0;
      return $q(function (resolve, reject) {
        polling = $interval(function () {
          count++;
          return $data.resources.licenses.get({id: license.id}).$promise
            .then(function (lic) {
              if (count === 15) {
                modal.scope.message += '<p>Still waiting? Feel free to close this screen, we\'ll send you an SMS when your validation is completed.</p>';
              }
              if (lic.status !== 'complete') {
                return;
              }
              if (lic.outcome === 'clear') {
                cancelPolling();
                modal.remove();
                resolve();
                return;
              }
              if (lic.outcome === 'consider') {
                cancelPolling();
                modal.remove();
                reject({code: 'LICENSE_MANUAL_CHECK'});//'LICENSE_CONSIDER'});
                return;
              }
              if (lic.outcome === 'reject') {
                cancelPolling();
                modal.remove();
                reject({code: 'LICENSE_FAILED'});
                return;
              }
              cancelPolling();
              modal.remove();
              reject(lic);
            });
        }, 2000);

      });
    });
  }

  function success () {
    var modal;
    return $modal('result', {
      icon: 'check-icon',
      title: 'License validation cleared.',
      actions: [{
        text: 'OK',
        className: 'button-balanced',
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

  function manualCheck () {
    var modal;
    $modal('result', {
      icon: 'waivecar-mark',
      title: 'Manual license validation required.',
      message: 'Driver\'s License is pending further review and you are unable to book a WaiveCar at this time. <br>' +
        'You\'ll receive an SMS when this validation passes.',
      actions: [{
        className: 'button-dark',
        text: 'Go back',
        handler: function () {
          if (modal) {
            modal.remove();
          }
          $ionicHistory.goBack();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  function failure () {
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'License validation failed',
      message: 'Driver\'s License has failed validation and you are unable to book a WaiveCar at this time. <br>' +
        'Please contact us if you would like further information or a copy of your report from our validation provider.',
      actions: [{
        className: 'button-dark',
        text: 'Go back',
        handler: function () {
          if (modal) {
            modal.remove();
          }
          $ionicHistory.goBack();
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  return {
    validate: validate,
    cancelPolling: cancelPolling
  };
}

module.exports = angular.module('app.services')
  .factory('$validateLicense', ['$injector', LicenseValidationService]);
