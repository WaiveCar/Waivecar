'use strict';

let Sms         = Bento.provider('sms');
let Slack       = Bento.provider('slack');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let error       = Bento.Error;
let config      = Bento.config.waivecar;
let log         = Bento.Log;
let slack       = new Slack('notifications');

module.exports = {

  /**
   * Sends a sms text message.
   * @param {Object} user
   * @param {String} message
   */
  *sendTextMessage(user, message) {
    let sms = new Sms();
    yield sms.send({
      to      : user.phone,
      message : message
    });
  },

  /**
   * Loops through an array of users and sends a message.
   * @param {Array}  users
   * @param {String} message
   */
  *sendToAll(users, message) {
    // users.forEach(function *(user) {
    //   yield this.sendTextMessage(user, message).bind(this);
    // });
  },

  /**
   * Notifies all administrators.
   * @param {String} message
   * @param {String} channel
   */
  *notifyAdmins(message, channel) {
    /*
    let admins = yield User.find(queryParser({ role : 'admin' }, {
      where : {
        role : queryParser.STRING
      }
    }));
    channel = channel || 'sms';
    switch (channel) {
      case 'sms' : return yield this.sendToAll(admins, message);
    }
    */
  },

  /**
   * Sends a slack notification to the waivecar slack.
   * @param {Object} payload
   */
  *slack(payload) {
    yield slack.message(payload);
  }

};
