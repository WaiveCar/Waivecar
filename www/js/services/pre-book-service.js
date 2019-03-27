'use strict';
var angular = require('angular');
var _ = require('lodash');

function PreBookService ($injector) {
  var $modal = $injector.get('$modal');
  var $q = $injector.get('$q');
  var $state = $injector.get('$state');
  var $data = $injector.get('$data');
  var $auth = $injector.get('$auth');
  var $validateLicense = $injector.get('$validateLicense');
  var $ionicLoading = $injector.get('$ionicLoading');
  var ctrl;

  function handlePreBookError(err, licenses) {
    var modal, message, title;
    var actions = [{
      className: 'button-balanced',
      text: 'OK',
      handler: function () {
        modal.remove();
      }
    }];

    if (err && err.data) {
      message = err.data.message;
      title = err.data.title;

      if (err.data.code === 'CAR_IN_PROGRESS') {
        return $modal('result', {
          icon: 'x-icon',
          title: 'You have a booking already in progress',
          message: err.data.message,
          actions: [{
            className: 'button-dark',
            text: 'Ok',
            handler: function () {
              modal.remove();
            }
          }]
        }).then(function (_modal) {
          modal = _modal;
          modal.show();
          return $q.reject(err);
        });
      }
      
      if (err.data.options) {
        var parts = message.split('\t');
        message = parts[0];

        actions = _.map(err.data.options, function(row) {
          row.theme = row.theme || 'balanced';
          return {
            className: 'button-' + row.theme,
            text: row.title,
            handler: function (){
              modal.remove();
              // since there's no reasonable way to do raw queries without
              // going through some expansive multi-faceted layer of complex
              // abstractions, the only way to reasonably do classic industry
              // standardized CRUD is to use this injected function to 
              // bridge between the complicated obtuse irrational layers of 
              // protection and isolation.
              if(row.action && ctrl.injected && row.action.url === 'bookings') {
                ctrl.injected('book', JSON.parse(row.action.params));
              } else if(row.evaljs) {
                // take that crockford!
                eval(row.evaljs);
              }
            }
          }
        });
      }

      if (err.data.data) {
        var data = err.data.data;
        actions = _.map(data.required, function (field) {
            if (field === 'license') {
              return {
                className: 'button-balanced',
                text: licenses.length ? 'Validate driver\'s license' : 'Add driver\'s license',
                handler: function () {
                  validateDriversLicense(modal);
                }
              };
            } else if (field === 'license photo') {
              return {
                className: 'button-balanced',
                text: licenses.length ? 'Validate license photo' : 'Add license photo',
                handler: function () {
                  validateDriversLicense(modal);
                }
              };
            } else if (field === 'credit card') {
              return {
                className: 'button-balanced',
                text: 'Add payment method',
                handler: function () {
                  modal.remove();
                  $state.go('credit-cards-form', {fromBooking: true});
                }
              };
            } else if (field === 'phone') {
              if ($auth.me.phone) {
                return {
                  className: 'button-balanced',
                  text: 'Validate phone number',
                  handler: function () {
                    modal.remove();
                    $state.go('auth-account-verify', {fromBooking: true});
                  }
                };
              } else {
                return {
                  className: 'button-balanced',
                  text: 'Add phone number',
                  handler: function () {
                    modal.remove();
                    $state.go('users-edit', {fromBooking: true});
                  }
                };
              }
            }
          });
        actions.push({
          className: 'button-dark',
          text: 'Cancel booking',
          handler: function () {
            modal.remove();
            $state.go('cars');
          }
        });
      }
    }

    return $modal('result', {
      title: title || 'Unable to book',
      message: message,
      actions: actions
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
      if(err.data.code === 'USER_READ_RULES') {
        $state.go('quiz-index');
      }
      return $q.reject(err);
    });
  }

  function validateDriversLicense (modal) {
    return $data.initialize('licenses')
      .then(function (licenses) {
        return _(licenses).filter({userId: $auth.me.id}).sortBy('createdAt').last();
      }).then(function (license) {
        modal.remove();
        if (license == null) {
          return $state.go('licenses-new', {fromBooking: true});
        } else if (!license.fileId) {
          return $state.go('verify-id');
        } else if (license.status === 'provided') {
          return $validateLicense.validate(license);
        }
        $state.go('licenses-edit', {licenseId: license.id});
      });
  }

  function catchPreBookError (err) {
    $ionicLoading.hide();
    $data.initialize('licenses').then(function(licenses) {
      handlePreBookError(err, licenses);
    });
  };

  ctrl = catchPreBookError;

  return catchPreBookError;
}

module.exports = angular.module('app.services').factory('$preBook', [
  '$injector',
  PreBookService
]);
