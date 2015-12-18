'use strict';
var angular = require('angular');

function LicenseEditController ($injector, licenses, $scope) {
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $modal = $injector.get('$modal');
  var $timeout = $injector.get('$timeout');
  var $ionicHistory = $injector.get('$ionicHistory');
  var $q = $injector.get('$q');
  var $interval = $injector.get('$interval');
  var USStates = $injector.get('USStates');
  var $message = $injector.get('$message');

  if (Array.isArray(licenses) && licenses.length) {
    this.license = licenses[0];
  } else if (licenses instanceof $data.resources.licenses) {
    this.license = licenses;
  } else {
    this.license = new $data.resources.licenses({
      userId: $auth.me.id,
      country: 'USA'
    });
  }

  if (!this.license.firstName) {
    this.license.firstName = $auth.me.firstName;
    this.license.lastName = $auth.me.lastName;
  }

  if (!(this.license instanceof $data.resources.licenses)) {
    this.license = new $data.resources.licenses(this.license);
  }

  this.canEdit = (this.license.status == null || this.license.status === 'pending');
  this.states = USStates;

  function success () {
    var modal;
    return $modal('result', {
      icon: 'check-icon',
      title: 'License verification worked'
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
      return modal;
    })
    .then(function () {
      return $timeout(1000)
      .then(function () {
        if (modal) {
          modal.remove();
        }
        $ionicHistory.goBack();
      });
    });
  }

  function failure (err) {
    var modal;
    $modal('result', {
      icon: 'x-icon',
      title: 'License validation failed',
      message: 'Driver\'s License has failed verification and you are unable to book a WaiveCar at this time. ' +
        'Please contact us if you would like more information in relation to the status of your Driver\'s License.',
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
    $q.reject(err);
  }

  this.update = function updateLicense (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your credentials first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }
    if (this.license.status !== 'pending') {
      return $message.error('Your license cannot be verified at this time');
    }
    var self = this;
    return this.license.$save()
    .then(function () {
      return $data.resources.licenses.verify({id: this.license.id}).$promise;
    }.bind(this))
    .then(function () {
      var modal;
      var modalOpts = {
        title: 'Validating your license',
        message: 'Validating usually takes 10 seconds. However in some cases it could take up to 48 hours',
        icon: '/templates/modals/loader.html'
      };
      return $modal('result', modalOpts)
      .then(function (_modal) {
        modal = _modal;
        modal.show();

        var count = 0;
        return $q(function (resolve, reject) {
          var polling = $interval(function () {
            count++;
            return self.license.$get()
              .then(function (lic) {
                if (count === 3) {
                  modal.scope.message += '<p>Still waiting? Feel free to close this screen, we\'ll send you an SMS when your validation is completed.</p>';
                }
                if (lic.status !== 'complete') {
                  return;
                }
                if (lic.outcome === 'consider') {
                  modal.scope.message += '<p>Still waiting? Feel free to close this screen, we\'ll send you an SMS when your validation is completed.</p>';
                  cancelPolling();
                }
                if (lic.outcome === 'clear') {
                  $interval.cancel(polling);
                  modal.remove();
                  resolve();
                  return;
                }
                cancelPolling();
                modal.remove();
                reject(lic);
              });
          }, 10000);

          function cancelPolling () {
            if (polling == null) {
              return;
            }
            $interval.cancel(polling);
            polling = null;
          }

          $scope.$on('$destroy', function () {
            cancelPolling();
          });
        });
      });
    })
    .then(success)
    .catch(failure);
  };

  this.cancel = function cancel () {
    $ionicHistory.goBack();
  };
}

module.exports = angular.module('app.controllers').controller('LicenseEditController', [
  '$injector',
  'licenses',
  '$scope',
  LicenseEditController
]);
