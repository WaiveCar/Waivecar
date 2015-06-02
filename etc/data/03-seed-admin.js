exports = module.exports = function(User, Role, MigrationService, config, logger, done) {

  var model = config.admin;

  var migrationFn = function(next) {
    Role.findOne({ name: 'admin' }).exec(function(err, role) {
      model.roles = [ role.id ];
      User.create(model, next);
    });
  };

  MigrationService.execute(__filename, migrationFn, function(err) {
    if (err) logger.warn('migration Failed for ' + __filename, err);
    logger.info('migration completed for ' + __filename);
    return done();
  });

};

exports['@require'] = [ 'models/user', 'models/role', 'services/migration-service', 'igloo/settings', 'igloo/logger' ];
