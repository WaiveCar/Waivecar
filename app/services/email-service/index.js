var async = require('async');
var _ = require('lodash');
var nodemailer = require('nodemailer');
var moment = require('moment');
exports = module.exports = function(SettingsService, config, email, logger) {

  var methods = {

    send: function(to, templateName, context, next) {
      SettingsService.getValue('app_email_notifications', function(err, fromEmail) {
        if (err) return next(err);

        context.siteLink = config.url;
        context.siteName = config.app.name;
        context.brandImage = config.url + '/img/brand-logo@2x.png';
        context.appImage = config.url + '/img/app-logo@2x.png';
        context.currentYear = moment().format('YYYY');

        var headers = {
          to: to,
          from: context.from || fromEmail.value || config.email.sender,
          subject: [ config.app.name, context.subject || 'Notification' ].join(' - ')
        };

        var conf = config.email.transport;
        email(templateName || 'default', context, headers, conf, function(err) {
          if (err) {
            console.log(err);
            return next(err);
          }
          return next();
        });
      });
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'services/settings-service',
  'igloo/settings',
  'igloo/email',
  'igloo/logger'
];
