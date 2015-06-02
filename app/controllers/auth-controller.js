var moment = require('moment');
var jwt = require('jwt-simple');
var moment = require('moment');
var async = require('async');
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var validator = require('validator');

exports = module.exports = function(User, AuthService, EmailService, config, logger) {

  var methods = {

    signin: function(req, res, next) {
      User.findOne({ email: req.body.email }).exec(function(err, user) {
        if (!user) return res.status(401).send({ message: 'Incorrect email address or password' });
        if (req.body.isAdmin) {
          user.comparePassword(req.body.password, function(err, isMatch) {
            if (!isMatch) return res.status(401).send({ message: 'Incorrect email address or password' });
            AuthService.isAdmin(user, function(err, isAdmin) {
              if (isAdmin) return res.send({ token: AuthService.createToken(user) });
              return res.status(401).send({ message: 'Incorrect email address or password to perform this action' });
            });
          });
        } else {
          // NB. this logs a user in without a need for a password!!!!
          return res.send({ token: AuthService.createToken(user) });
        }
      });
    },

    signup: function(req, res, next) {
      var email = req.body.email;
      User.findOne({ email: email }).exec(function(err, existingUser) {
        if (existingUser) return res.status(409).send({ message: 'Email is already taken' });

        EmailService.isBlackListed(email, function(err, isBlacklisted) {
          if (err) return next(err);

          if (isBlacklisted) return res.status(400).send({ message: 'Email address is not valid. Please contact us if you believe your Email address is valid and acceptable.' });

          var user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: email,
            password: req.body.password
          });

          user.save(function(err) {
            if (err) logger.debug(err);
            return res.send({ token: AuthService.createToken(user) });
          });

        });
      });
    },

    // forgot password - email request to reset.
    resetRequest: function(req, res, next) {
      if (!_.isString(req.body.email) || !validator.isEmail(req.body.email)) {
        return res.status(401).send({ message: 'Invalid or unknown email address entered' });
      }

      AuthService.generateAndSendResetToken(req.body.email, function(err) {
        if (err) return next(err);
        return res.sendStatus(200);
      });
    },

    // validate reset link and get user
    reset: function(req, res, next) {
      AuthService.validateResetToken(req.params.emailToken, req.params.resetToken, function(err, user) {
        if (err) return next(err);
        return res.send({
          mode: 'reset',
          user: user
        });
      });
    },

    // post password update
    changePassword: function(req, res, next) {
      //TODO: validate password stregth
      User.findOne({ email: req.body.email }).exec(function(err, user) {
        if (!user) return res.status(401).send({ message: 'Incorrect email address or password' });

        user.password = req.body.password;
        user.save(function(err, updatedUser) {
          if (err) return next(err);
          return res.send({ token: AuthService.createToken(user) });
        });
      });
    },

    unlink: function(req, res, next) {
      var provider = req.params.provider;
      User.findById(req.user.id, function(err, user) {
        if (!user) return res.status(400).send({ message: 'User not found' });

        user[provider] = undefined;
        user.save(function() {
          return res.status(200).end();
        });
      });
    }

  };

  return methods;
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user', 'services/auth-service', 'services/email-service', 'igloo/settings', 'igloo/logger' ];
