'use strict';

let Sms         = Bento.provider('sms');
let Slack       = Bento.provider('slack');
let Email       = Bento.provider('email');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let GroupUser   = Bento.model('GroupUser');
let error       = Bento.Error;
let config      = Bento.config;
let log         = Bento.Log;
let slack       = new Slack();
let FCM         = require('fcm-node');

let fs          = require('fs');

function log_message(type, what) {
  // There's probably a more frameworky way of doing this in a much
  // more convoluted and hard way --- watch me not care at all.
  what.t = type;
  what.at = new Date();

  try {
    fs.appendFile('/var/log/outgoing/log.txt', JSON.stringify(what) + "\n");
  } catch (err) {
    log.warn(`Failed to write to the log file: ${ err.message }`);
  }
}

let fcm = new FCM(config.push.serverKey);

module.exports = {
  /**
   * Sends a sms text message.
   * @param {Object} user
   * @param {String} message
   */
  *sendTextMessage(query, message) {
    let user = false;
    if(Number.isInteger(query)) {
      user = yield User.findById(query);
    } else {
      user = query;
    }
    if(!user) {
      log.warn(`Failed to send sms to user query of ${ query } > ${ err.message }`);
    }

    log_message('sms', {phone: user.phone, text: message});

    if (user.phone && process.env.NODE_ENV === 'production') {
      try {
        let sms = new Sms();
        yield sms.send({
          to      : user.phone,
          message : message
        });
      } catch (err) {
        log.warn(`Failed to send sms to ${ user.name() } > ${ err.message }`);
      }
    }
    return user;
  },

  *sendPushNotification(query, message) {
    let user = false;
    if(Number.isInteger(query) || typeof query === 'string') {
      user = yield User.findById(query);
    } else {
      user = query;
    }
    if(!user) {
      log.warn(`Failed to send sms to user query of ${ query } > ${ err.message }`);
    }

    log_message('push', {deviceToken: user.deviceToken, text: message});

    if (user.deviceToken) {
      try {

        fcm.send({
            to: user.deviceToken,
            priority: "high",
            notification: {
              title: 'Waivecar',
              body: message,
              sound: "default"
            }
          },
          function(err, res){
            if (err) {
              log.warn(`Failed to send push notification to ${ user.name() } > ${ err.message }`);
            }
          }
        );
      } catch (err) {
        log.warn(`Failed to send push notification to ${ user.name() } > ${ err.message }`);
      }
    }
    return user;
  },

  /**
   * Loops through an array of users and sends a message.
   * @param {Array}  users
   * @param {String} message
   */
  *sendToAll(users, message) {
    for (let i = 0, len = users.length; i < len; i++) {
      yield this.sendTextMessage(users[i], message);
    }
  },

  /**
   * Notifies all administrators.
   * @param {String} message
   * @param {Mixed}  channels String or Array of channels to notify
   */
  *notifyAdmins(message, channels, params) {
    if (typeof channels === 'string') {
      channels = [ channels ];
    }

    let admins = yield GroupUser.find({
      where : {
        groupRoleId : {
          $gte : 3
        }
      }
    });

    if (admins && admins.length) {
      let users = yield User.find({
        where : {
          id : {
            $in : admins.reduce((list, next) => {
              list.push(next.id);
              return list;
            }, [])
          }
        }
      });

      if (channels.indexOf('slack') !== -1) {
        yield this.slack({
          text : message
        }, params);
      }

      if (channels.indexOf('sms') !== -1) {
        yield this.sendToAll(users, message);
      }

      if (channels.indexOf('email') !== -1) {
        let mailingList = users.reduce((list, next) => {
          list.push(next.email);
          return list;
        }, []);
        yield this.email({
          to       : mailingList.join(','),
          from     : config.email.sender,
          subject  : 'WaiveCar [Notification]',
          template : 'waivecar-notification',
          context  : {
            message : message
          }
        });
      }
    }
  },

  /**
   * Sends a slack notification to the waivecar slack.
   * @param {Object} payload
   */
  *slack(payload, params) {
    if (params && params.channel) payload.channel = params.channel;
    log_message('slack', payload);

    if (process.env.NODE_ENV === 'production') {
      try {
        yield slack.message(payload);
      } catch (err) {
        log.warn('Failed to deliver slack message');
      }
    } 
  },

  /**
   * Sends a new email.
   */
  *email(payload) {
    let email = new Email();
    log_message('email', payload);
    yield email.send(payload);
  }

};
