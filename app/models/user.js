var util = require('util');
var _ = require('lodash');
var _str = require('underscore.string');
_.mixin(_str.exports());
var validator = require('validator');
var bcrypt = require('bcryptjs');
var async = require('async');
var jsonSelect = require('mongoose-json-select');

exports = module.exports = function(Role, EnumService, mongoose, mongoosePlugin) {

  var validations = {
    name: [ function(val) { return !_.isBlank(val); }, '{path} was blank' ],
    email: [ validator.isEmail, 'Email is not a valid address' ]
  };

  var Model = new mongoose.Schema({

    state: { type: String, required: true, enum: _.pluck(EnumService.getStateTypes(), 'name'), default: 'active' },

    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true, validate: validations.email },

    password: { type: String },

    salt:  { type: String },

    firstName: { type: String, required: true, trim: true, validate: validations.name },

    lastName: { type: String, required: true, trim: true, validate: validations.name },

    location: { type: String },

    phoneCountryCode: { type: String },

    phoneNumber:  { type: Number },

    resetToken: { type: String },

    resetAt: { type: Date },

    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }],

    facebookId: String,
    facebookAccessToken: String,
    facebookRefreshToken: String,

    googleId: String,
    googleAccessToken: String,
    googleRefreshToken: String

  });

  Model.pre('save', function(next) {
    var user = this;
    var setPassword = function(user, next) {
      if (!user.isModified('password')) return next();
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          user.password = hash;
          user.salt = salt;
          next();
        });
      });
    };

    if (user.roles.length === 0) {
      Role.findOne({ name: 'user'}).exec(function(err, role) {
        if (err) return next(new Error('User role cannot be found.'));
        user.roles.push(role);
        return setPassword(user, next);
      });
    } else {
      return setPassword(user, next);
    }
  });

  Model.methods.comparePassword = function(password, next) {
    var model = this;
    bcrypt.compare(password, model.password, function(err, isMatch) {
      next(err, isMatch);
    });
  };

  Model.virtual('object').get(function() {
    return 'user';
  });

  Model.virtual('fullEmail').get(function() {
    var user = this;
    return util.format('%s <%s>', user.name, user.email);
  });

  Model.virtual('name').get(function() {
    var user = this;
    var name = user.email;
    if (user.firstName) name = user.firstName;
    if (user.lastName) name += util.format(' %s', user.lastName);
    return name;
  });

  Model.methods.getPermissions = function(next) {
    var model = this;
    var permissions = [];
    async.each(model.roles, function(role, complete) {
      Role.findById(role).exec(function(err, role) {
        if (err) return complete(err);
        if (!role) return complete(new Error('Role not found'));
        permissions = _.union(permissions, role.permissions);
        return complete();
      });
    }, function(err) {
      if (err) return next(err);
      return next(null, permissions);
    });
  };

  Model.plugin(mongoosePlugin);
  Model.plugin(jsonSelect, '-password -salt');
  return mongoose.model('User', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/role', 'services/enum-service', 'igloo/mongo', 'lib/mongoose-plugin' ];
