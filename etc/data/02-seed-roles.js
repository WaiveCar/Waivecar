exports = module.exports = function(Role, MigrationService, config, logger, done) {

  var models = [
    {
      name: 'admin',
      description: 'Administration Portal Access',
      permissions: [ 'app', 'can-access-admin', 'can-fetch-all' ]
    },
    {
      name: 'user',
      description: 'App Access',
      permissions: [ 'app' ]
    }
  ];

  var migrationFn = function(next) {
    Role.create(models, next);
  };

  MigrationService.execute(__filename, migrationFn, function(err) {
    if (err) logger.warn('migration Failed for ' + __filename, err);
    logger.info('migration completed for ' + __filename);
    return done();
  });
};

exports['@require'] = [ 'models/role', 'services/migration-service', 'igloo/settings', 'igloo/logger' ];
