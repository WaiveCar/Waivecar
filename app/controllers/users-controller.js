var path = require('path');
var _ = require('lodash');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(Model, Setting, config) {
  var methods = {
    meta: {
      config: config,
      controllerName: 'users',
      model: Model,
      modelName: 'user'
    },

    beforeUpdate: function(model, req, res, next) {
      _.extend(model, req.body);
      model.name = req.body.name || model.name;
      model.email = req.body.email || model.email;
      return next(null, model);
    },

    me: function(req, res, next) {
      Model.findById(req.user.id, function(err, user) {
        if (err) return next(err);
        var model = user.toJSON();
        Setting.find({}).exec(function (err, settings) {
          model.environment = {
            settings: settings
          };
          return res.format({
            json: function() {
              res.json(model);
            }
          });
        });
      });
    }
  };

  return _.merge(new Blueprint(methods.meta), methods);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user', 'models/setting', 'igloo/settings' ];
