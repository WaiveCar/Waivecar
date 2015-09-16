'use strict';
var angular = require('angular');
require('ionic-angular');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('$message', [
  '$ionicPopup',
  function ($ionicPopup) {
    var existingMessage;

    function launchPopup(title, message) {
      if (_(message).isObject()) {
        if (message.data && _(message.data).isString()) {
          message = message.data;
        }
      }

      if (!_(message).isString()) {
        message = JSON.stringify(message);
      }

      if (existingMessage === message) {
        // Prevent opening another popup with the same exact message
        return false;
      }

      existingMessage = message;

      $ionicPopup.alert({
        title: title,
        template: message
      })
        .then(function () {
          existingMessage = null;
        });

    }

    return {

      error: function (message) {
        launchPopup('Error', message);
      },

      info: function (message) {
        launchPopup('Info', message);
      },

      success: function (message) {
        launchPopup('Success!', message);
      }
    };

  }
]);
