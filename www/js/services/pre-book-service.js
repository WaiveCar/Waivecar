'use strict';
var angular = require('angular');
var _ = require('lodash');

function PreBookService ($injector) {
  var $modal = $injector.get('$modal');
  var $q = $injector.get('$q');
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');

  return function catchPreBookError (err) {
    var modal;
    var actions = [{
      className: 'button-balanced',
      text: 'OK',
      handler: function () {
        modal.remove();
      }
    }];

    if (err && err.data && err.data.code === 'CAR_IN_PROGRESS') {
      return $modal('result', {
        icon: 'x-icon',
        title: err.data.message,
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

    if (err && err.data && err.data.data) {
      var data = err.data.data;
      var base = {
        className: 'button-balanced',
      };
      actions = _.map(data.required, function (field) {
          if (field === 'license') {
            return angular.extend({}, base, {
              text: 'Validate driver\'s license',
              handler: function () {
                modal.remove();
                $state.go('licenses-form', {fromBooking: true});
              }
            });
          } else if (field === 'credit card') {
            return angular.extend({}, base, {
              text: 'Add payment method',
              handler: function () {
                modal.remove();
                $state.go('credit-cards-form', {fromBooking: true});
              }
            });
          } else if (field === 'email') {
            return angular.extend({}, base, {
              text: 'Validate email',
              handler: function () {
                modal.remove();
                $message.info('Please click on the email you received');
              }
            });
          } else if (field === 'phone') {
            return angular.extend({}, base, {
              text: 'Validate phone number',
              handler: function () {
                modal.remove();
                $state.go('auth-account-verify', {fromBooking: true});
              }
            });
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
    return $modal('result', {
      icon: 'x-icon',
      title: 'Missing Required Information',
      message: err && err.data && err.data.message,
      actions: actions
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
      return $q.reject(err);
    });
  };
}

module.exports = angular.module('app.services').factory('$preBook', [
  '$injector',
  PreBookService
]);
