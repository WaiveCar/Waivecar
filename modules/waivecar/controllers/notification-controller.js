'use strict';

let notify = require('../lib/notification-service');
let config = Bento.config.notification;
let User = Bento.model('User');

Bento.Register.Controller('NotificationsController', function(controller) {

  /**
   * Send notification to user
   * @return {Object}
   */
  controller.send = function *() {
    let message;
    let user = this.auth && this.auth.user;
    if (!user) {
      user = yield User.findById(this.payload.userId);
    }
    switch (this.payload.type) {
      case 'sms':
        return yield handleSms(user, this.payload.message);
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
   *
  */
  function *handleSms(user, message) {
    let sent = false;
    yield notify.sendTextMessage(user, `WaiveCar: ${ message }`);
    sent = true;
    return { sent };
  }

  return controller;
});
