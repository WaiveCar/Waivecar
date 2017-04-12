'use strict';
var angular = require('angular');
require('ionic-angular');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('$message', [
  '$ionicPopup',
  function ($ionicPopup) {
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

      // See #716 - we want to minimize JS errors being passed back to the
      // user - What this thing is is essentially a weirdo JS object being
      // converted to a string ... better solution would be something like
      if (!_(message).isString()) {
        message = 'Something unexpected happened. Please try again.\nIf this problem persists, please contact us.';
        //message = JSON.stringify(message);
      }

      $ionicPopup.alert({
        title: title,
        template: message
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
