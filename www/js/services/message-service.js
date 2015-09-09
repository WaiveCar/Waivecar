angular.module('app.services').factory('$message', [
  '$ionicPopup',
  function ($ionicPopup) {

    function launchPopup(title, message) {
      if (_(message).isObject()) {
        if (message.data && _(message.data).isString()) {
          message = message.data;
        }
      }

      if (!_(message).isString()) {
        message = JSON.stringify(message);
      }

      $ionicPopup.alert({
        title: title,
        template: message
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
