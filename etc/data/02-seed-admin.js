exports = module.exports = function(User, MigrationService, config, logger, done) {

  var migrationFn = function(next) {
    var model = config.admin;
    model.role = 'admin';
    User.create(model, next);
  };

  MigrationService.execute(__filename, migrationFn, function(err) {
    if (err) logger.warn('migration Failed for ' + __filename, err);
    logger.info('migration completed for ' + __filename);
    return done();
  });

};

exports['@require'] = [ 'models/user', 'services/migration-service', 'igloo/settings', 'igloo/logger' ];
