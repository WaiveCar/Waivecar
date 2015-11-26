'use strict';

let Sms         = Bento.provider('sms');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let error       = Bento.Error;
let config      = Bento.config.waivecar;
let log         = Bento.Log;

module.exports = class NotificationService {

  static *sendTextMessage(user, message) {
    let sms = new Sms();
    yield sms.send({
      to      : user.phone,
      message : message
    });
  }

  static *sendToAll(users, message) {
    // users.forEach(function *(user) {
    //   yield this.sendTextMessage(user, message).bind(this);
    // });
  }

  static *notifyAdmins(message, channel) {
    let admins = yield User.find(queryParser({ role : 'admin' }, {
      where : {
        role : queryParser.STRING
      }
    }));
    channel = channel || 'sms';
    switch (channel) {
      case 'sms' : return yield this.sendToAll(admins, message);
    }
  }

};
