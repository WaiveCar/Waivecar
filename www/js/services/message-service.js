'use strict';
var angular = require('angular');
require('ionic-angular');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('$message', [
  '$ionicPopup',
  function ($ionicPopup) {
    var existingMessage;

    function launchPopup(title, message) {
      if(message && _.contains([401, 403], message.status)){
        return false;
      }

      if (_(message).isObject()) {
        if (message.data) {
          if(_(message.data).isString()) {
            message = message.data;
          } else if( _(message.data).isObject() && _(message.data.message).isString() ) {
            message = message.data.message;
          }

        }
      }

      if (!_(message).isString()) {
        message = JSON.stringify(message);
      }

      // $log.log(message);

      if (existingMessage === message) {
        // Prevent opening another popup with the same exact message
        return false;
      }

      existingMessage = message;

      var promise = $ionicPopup.alert({
        title: title,
        template: message
      });

      promise
        .finally(function () {
          existingMessage = null;
        });

    }

    var debouncedPopup = _.debounce(launchPopup, 100);

    return {

      error: function (message) {
        debouncedPopup('Error', message);
      },

      info: function (message) {
        debouncedPopup('Info', message);
      },

      success: function (message) {
        debouncedPopup('Success!', message);
      }
    };

  }
]);
