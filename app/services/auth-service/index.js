var _ = require('lodash');
var async = require('async');
var bcrypt = require('bcryptjs');
var secret = 'secret-app-api-token';
var strength = require('strength');
var jwt = require('jwt-simple');
var moment = require('moment');
var shortid = require('shortid');
var util = require('util');

module.exports = function(User, Role, EnumService, JobService, config, logger) {

  var methods = {

    generateAndSendResetToken: function(email, next) {
      async.waterfall([
        function(nextTask) {
          User.findOne({ email: email }, nextTask);
        },
        function(user, nextTask) {
          if (!user) return nextTask(new Error('No such user with that email exists'));
          user.resetToken = shortid.generate();
          user.resetAt = new Date();
          user.save(nextTask);
        },
        function(user, n, nextTask) {
          var uniqueUrl = new Buffer(user.email).toString('base64');
          JobService.enqueue('email', {
            to: user.email,
            name: user.name,
            templateName: 'forgot',
            context: {
              subject: 'Password Reset Confirmation',
              username: user.name,
              resetlink: util.format('%s/reset-password/%s/%s', config.url, uniqueUrl, user.resetToken)
            }
          }, nextTask);
        }
      ], next);
    },

    validateResetToken: function(encodedEmail, token, next) {
      async.waterfall([
        function(nextTask) {
          var email = new Buffer(encodedEmail, 'base64').toString('ascii');
          User.findOne({ email: email }, nextTask);
        },
        function(user, nextTask) {
          if (!user) return nextTask(new Error('User not found'));

          var resetAt = moment(user.resetAt);
          if (moment().subtract(1, 'days').isAfter(resetAt)) {
            return nextTask(new Error('Reset token expired, please try to reset again'));
          }

          if (user.resetToken !== token) {
            return nextTask(new Error('Reset error, please try again'));
          }

          return nextTask(null, user);
        }
      ], next);
    },

    isAdmin: function(user, next) {
      user.getPermissions(function(err, permissions) {
        if (!err && permissions && _.contains(permissions, 'can-access-admin')) return next(null, true);
        return next(null, false);
      });
    },

    isValidPassword: function(password, callback) {

      // password validation
      if (_.isBlank(password)) {
        return callback(new Error('Password was blank'));
      }

      var howStrong = strength(password);
      if (howStrong < config.password.minStrength) {
        return callback(new Error('Password was not strong enough, please try again'));
      }

      return callback();
    },

    createToken: function(user) {
      var payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
      };

      return jwt.encode(payload, config.auth.tokenSecret);
    },

    verifyToken: function(token, verified) {
      // return jwt.verify(token, secret, {}, verified);

      var payload = jwt.decode(token, config.auth.tokenSecret);
      if (payload.exp <= moment().unix()) {
        logger.info('expired');
        return verified(new Error('Token has expired')); //false;//res.status(401).send({ message: 'Token has expired' });
      } else {
        return verified(null, payload);
      }
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [ 'models/user', 'models/role', 'services/enum-service', 'services/job-service', 'igloo/settings', 'igloo/logger' ];
