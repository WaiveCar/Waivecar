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

  setTimeout(function(){
    try {
      fs.appendFile('/var/log/outgoing/log.txt', JSON.stringify(what) + "\n", function(){});
    } catch (err) {
      log.warn(`Failed to write to the log file: ${ err.message }`);
    }
  },0);
}

let fcm = new FCM(config.push.serverKey);

module.exports = {
  *sendTextMessage(query, message, _user) {
    // this allows us to send messages to whomever
    // regardless of whether we've contacted them prior
    if(query._phone) {
      let sms = new Sms();
      yield sms.send({
        to      : query._phone,
        message : message
      });
    }

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
    // User communications will only be saved for users that have already been let in
    if (user && !user.accountType) {
      let UserCommunication = Bento.model('UserCommunication');
      let communication = new UserCommunication({
        userId: user.id,
        creatorId: _user ? _user.id : null,
        content: message,
        type: 'sms',
      });
      yield communication.save();
    }

    if (user.phone && process.env.NODE_ENV === 'production') {
      try {
        let sms = new Sms(user, _user);
        yield sms.send({
          to      : user.phone,
          message : message
        });
      } catch (err) {
        log.warn(`Failed to send sms to ${ user.phone } > ${ err.message }`);
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

  *tellChris(what, body) {
    body = body || {};
    yield this.email({
      to       : 'chris@waive.com',
      from     : config.email.sender,
      subject  : what,
      template : 'blank',
      context  : {
        payload: body
      }
    });
  },

  *notifyAdmins(message, channels, params) {
    yield this.slack({
      text : message
    }, params);
  },

  *slack(payload, params) {
    if (params && params.channel) payload.channel = params.channel;
    log_message('slack', payload);

    if (process.env.NODE_ENV === 'production' || params.force) {
      try {
        yield slack.message(payload);
      } catch (err) {
        log.warn('Failed to deliver slack message');
      }
    } 
  },

  *email(payload) {
    let email = new Email();
    log_message('email', payload);
    yield email.send(payload);
  }

};
