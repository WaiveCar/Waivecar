exports = module.exports = function(Setting, MigrationService, config, logger, done) {

  var model = {
    name: 'app_email_notifications',
    description: 'Application Email Address - Notification Alerts',
    value: 'noreply@example.com'
  };

  var migrationFn = function(next) {
    Setting.create(model, next);
  };

  MigrationService.execute(__filename, migrationFn, function(err) {
    if (err) logger.warn('migration Failed for ' + __filename, err);
    logger.info('migration completed for ' + __filename);
    return done();
  });

};

exports['@require'] = [ 'models/setting', 'services/migration-service', 'igloo/settings', 'igloo/logger' ];
