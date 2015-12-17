'use strict';
var angular = require('angular');
var _ = require('lodash');

function PreBookService ($injector) {
  var $modal = $injector.get('$modal');
  var $q = $injector.get('$q');
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');

  return function (err) {
    var modal;
    var actions = [{
      className: 'button-balanced',
      text: 'OK',
      handler: function () {
        modal.remove();
      }
    }];
    if (err.data && err.data.required) {
      var base = {
        className: 'button-balanced',
      };
      actions = _.map(err.data.required, function (field) {
          if (field === 'license') {
            return angular.extend({}, base, {
              text: 'Add driver\'s license',
              handler: function () {
                modal.remove();
                $state.go('licenses-edit', {id: null});
              }
            });
          } else if (field === 'credit card') {
            return angular.extend({}, base, {
              text: 'Add payment method',
              handler: function () {
                modal.remove();
                $state.go('credit-cards-edit', {id: null});
              }
            });
          } else if (field === 'email') {
            return angular.extend({}, base, {
              text: 'Validate email',
              handler: function () {
                modal.remove();
                $message.show('Please click on the email you received');
              }
            });
          } else if (field === 'phone') {
            return angular.extend({}, base, {
              text: 'Validate phone number',
              handler: function () {
                modal.remove();
                $state.go('auth-account-verify');
              }
            });
          }
        });
    }
    return $modal('result', {
      icon: 'x-icon',
      title: 'Missing Required Information',
      message: err.data && err.data.message,
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

