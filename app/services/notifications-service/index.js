var async = require('async');

exports = module.exports = function(config, logger, User, JobService) {

  var enqueueEmail = function (to, templateName, context, cb) {
    JobService.enqueue('email', {
      to: to,
      templateName: templateName,
      context: context
    }, cb);
  };

  var enqueueSMS = function (to, message, cb) {
    JobService.enqueue('sms', {
      number: to,
      message: message
    }, cb);
  };

  var methods = {

    sendNotification: function(notificationData, next, user) {
      return methods.notify(notificationData, next);
    },

    notify: function(notificationData, next) {
      if (!notificationData.userId) {
        return next(new Error('No user id given'));
      }

      User.findById(notificationData.userId).exec(function (err, user) {
        if (err) {
          return next(err);
        }

        if (!user) {
          return next(new Error('No user data found for ' + notificationData.userId));
        }

        switch (notificationData.notificationType) {
          case 'signup':
            if (user.email) {
              enqueueEmail(user.email, 'welcome', { subject: 'Welcome', from: config.email.sender }, next);
            } else {
              next(new Error('No email for user ' + notificationData.userId));
            }
            break;
          case 'password-reset':
            if (user.email) {
              enqueueEmail(user.email, 'password-reset', { subject: 'Password Reset' }, next);
            } else {
              next(new Error('No email for user ' + notificationData.userId));
            }
            break;
          default:
            return next(new Error('Unknown notification type'));
        }
      });
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'igloo/settings',
  'igloo/logger',
  'models/user',
  'services/job-service'
];
