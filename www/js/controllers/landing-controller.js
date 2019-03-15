/* global localStorage document */
'use strict';
var angular = require('angular');

function LandingController ($injector) {
  var $ionicActionSheet = $injector.get('$ionicActionSheet');

  this.openBasic = function () {
    window.open('https://basic.waivecar.com', '_system'); 
  }

  this.changeEnv = function () {
    var envs = ['prod', 'staging'];
    var currentEnv = localStorage.env || 'prod';
    var buttons = envs.map(function (env) {
      return {text: env};
    });

    var hideSheet = $ionicActionSheet.show({
      buttons: buttons,
      cancelText: 'Cancel',
      buttonClicked: function (buttonIndex) {
        var button = buttons[buttonIndex];
        if (button.text === currentEnv) {
          hideSheet();
          return;
        }

        localStorage.env = button.text;
        hideSheet();
        setTimeout(function () {
          document.location.reload();
        }, 500);
      }
    });
    return true;
  };
}

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$injector',
  LandingController
]);
