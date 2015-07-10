var async = require('async');

exports = module.exports = function(BlacklistedEmail, Media, Booking, Vehicle, User, Setting, Migration, config, logger, done) {

  if (config.cleanOnRestart && config.server.env === 'development') {
    var models = [ BlacklistedEmail, Media, Booking, Vehicle, User, Setting, Migration ];

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

exports['@require'] = [ 'models/blacklisted-email', 'models/media', 'models/booking', 'models/vehicle', 'models/user', 'models/setting', 'models/migration', 'igloo/settings', 'igloo/logger' ];
