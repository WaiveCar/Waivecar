/* global window */
'use strict';
var angular = require('angular');
require('./data-service');

angular.module('app.services')
  .service('NotificationService', NotificationService);

NotificationService.$inject = ['$data', '$modal'];
function NotificationService($data, $modal) {

  function showPushNotificationModal (text) {
    var modal;
    $modal('result', {
      icon: 'waivecar-mark',
      title: 'Notification',
      message: text,
      actions: [{
        className: 'button-dark',
        text: 'Go back',
        handler: function () {
          if (modal) {
            modal.remove();
          }
        }
      }]
    })
    .then(function (_modal) {
      modal = _modal;
      modal.show();
    });
  }

  this.setupPushNotifications = function () {
    window.FirebasePlugin.onTokenRefresh(function(token) {
      console.log("TOKEN" + token);

      $data.resources.notification.refreshDeviceToken({
        deviceToken: token
      }).$promise
        .then(function() {

        });

    }, function(error) {
      console.error(error);
    });

    window.FirebasePlugin.onNotificationOpen(function(notification) {

      /*collapse_key: "com.waivecar.app" from: "1000758502524" google.message_id : "0:1507813040297820%dd2e9ac6dd2e9ac6" google.sent_time:1507813040289 tap:true   */

      if (!notification.tap) {
        showPushNotificationModal(notification.body);
      }
      console.log(notification);
    }, function(error) {
      console.error(error);
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
