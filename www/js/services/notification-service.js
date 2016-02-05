'use strict';
var angular = require('angular');
require('./data-service');

angular.module('app.services')
  .service('NotificationService', NotificationService);

NotificationService.$inject = ['$data'];
function NotificationService($data) {

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
