var async = require('async');

exports = module.exports = function(Media, User, Setting, Migration, config, logger, done) {

  if (config.cleanOnRestart && config.server.env === 'development') {
    var models = [ Media, User, Setting, Migration ];

    var iterator = function(Model, next) {
      var model = new Model();
      model.collection.drop(function(err) { return next(); });
    };

    async.forEachSeries(models, iterator, function(err) {
      logger.info(config.server.env + ': dropped collections.');
      return done();
    });

  } else {
    return done();
  }

};

exports['@require'] = [ 'models/media', 'models/user', 'models/setting', 'models/migration', 'igloo/settings', 'igloo/logger' ];
