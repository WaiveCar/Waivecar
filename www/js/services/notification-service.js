'use strict';
var angular = require('angular');
require('./data-service');

angular.module('app.services')
  .service('NotificationService', NotificationService);

NotificationService.$inject = ['$data', '$utils'];
function NotificationService($data, '$utils') {

  this.refreshDeviceToken = function () {
    FCMPlugin.onTokenRefresh(function(token){

    });
  };

  this.notifySms = function(code) {
    return _notify('sms', code);
  };

  function _notify(type, code) {
    var payload = {
      type: type,
      reason: code
    };

    return $data.resources.notification.create(payload);
  }
}
