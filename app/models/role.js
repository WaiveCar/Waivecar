var _ = require('lodash');

exports = module.exports = function(EnumService, mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    name: { type: String, lowercase: true, trim: true, required: true, index: true },

    description: { type: String },

    // group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },

    permissions: { type: Array },

    // custom: { type: Object, default: {}, comment: 'hash of custom attributes.' }

  });

  Model.statics.addPermssion = function(roleId, permission, next) {
    var model = this;
    permission = permission.toLowerCase().trim();

    if (!_.contains(EnumService.getPermissionTypes(), permission)) {
      return next(new Error('Invalid Permission'));
    }

    if (_.contains(model.permissions), permission) {
      return next(new Error('Permission already exists in Role'));
    }

    model.permissions.push(permission);
    model.save(next);
  };

  Model.statics.removePermission = function(roleId, permission, next) {
    var model = this;
    permission = permission.toLowerCase().trim();

    var index = _.indexOf(model.permissions, permission);
    if (index) {
      model.permissions.splice(index, 1);
      model.save(next);
    } else {
      // permission does not exist.
      return next();
    }
  };

  Model.plugin(mongoosePlugin);
  return mongoose.model('Role', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'igloo/mongo', 'lib/mongoose-plugin' ];
