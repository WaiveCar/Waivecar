var fs = require('fs');
var async = require('async');
var rm = require('rimraf');
var path = require('path');

exports = module.exports = function(Media, config, logger) {

  var methods = {

    deleteFile: function(media, next) {
      if (!media) return next(new Error('No media object given'));
      Media.findById(media.id).exec(function (err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Media model not found'));
        if (!model.location) return next(new Error('No file location given'));
        return methods.delete(model.location, next);
      });
    },

    delete: function(location, next) {
      async.series([
        function (cb) {
          fs.exists(location, function (exists) {
            if (!exists) return cb(new Error('File not found: ' + location));
            return cb(null, exists);
          });
        },
        function (cb) {
          var folder = path.dirname(location);
          fs.readdir(folder, function(err, files) {
            if (files.length < 2) {
              return rm(folder, cb);
            } else {
              return rm(location, cb);
            }
          });
        }
      ], next);
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'models/media',
  'igloo/settings',
  'igloo/logger'
];
