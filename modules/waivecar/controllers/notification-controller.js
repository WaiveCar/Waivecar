'use strict';

let notify = require('../lib/notification-service');
let config = Bento.config.notification;

Bento.Register.Controller('NotificationsController', function(controller) {

  /**
   * Send notification to user
   * @return {Object}
   */
  controller.send = function *() {
    let message;

    switch (this.payload.type) {
      case 'sms':
        return yield handleSms(this.auth.user, this.payload.reason);
      default:
        return {
          sent : false
        };
    }
  };

  controller.refreshDeviceToken = function *() {

    let deviceToken = this.payload.deviceToken;
    let user = this.auth.user;

    yield user.update({
      deviceToken : deviceToken
    });
  };

  controller.sendTestPush = function *(to) {

    if (process.env.NODE_ENV !== 'production') {
      yield notify.sendPushNotification(to, this.query.message);
    }
  };

  /**
   * Handle an sms notification using provided reason.
   * @param {Object} user
   * @param {String} reason
   * @param {Object}
   */
  function *handleSms(user, _reason) {
    let reason = config.reasons[_reason];
    let sent = false;
    if (reason) {
      // Send notification
      yield notify.sendTextMessage(user, `WaiveCar: ${ reason }`);
      sent = true;
    }
    return { sent };
  }

  return controller;
});
