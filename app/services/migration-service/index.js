var async = require('async');
var _ = require('lodash');
var path = require('path');

exports = module.exports = function(Migration, config, logger) {

  var methods = {

    addMigration: function(name, next) {
      return Migration.create({ name: name }, next);
    },

    getMigration: function(name, next) {
      return Migration.findOne({ name: name }).exec(next);
    },

    execute: function(name, migrationFn, next) {
      name = path.basename(name, '.js');
      methods.getMigration(name, function(err, existingMigration) {
        if (err) return next(err);
        // existing migration, silently return.
        if (existingMigration) return next(null);

        migrationFn(function(err) {
          if (err) return next(err);

          methods.addMigration(name, function(err, newMigration) {
            if (err) return next(err);
            return next(null, newMigration);
          });
        });
      });
    }

  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [ 'models/migration', 'igloo/settings', 'igloo/logger' ];
