var _ = require('lodash');
var jsonSelect = require('mongoose-json-select');
var findOrCreate = require('mongoose-findorcreate');
var paginate = require('mongoose-paginate');

// we dont use the default plugin from Eskimo as we want to use camelCase naming throughout.
exports = module.exports = function() {

  return function(Schema) {

    Schema.add({
      stateUpdatedAt: Date,
      updatedAt: Date,
      createdAt: Date
    });

    Schema.pre('save', function(next) {
      var model = this;
      model.updatedAt = (model.createdAt) ? Date.now() : model._id.getTimestamp();
      if (!model.createdAt) model.createdAt = model._id.getTimestamp();

      if (model.isNew || model.isModified('state')) {
        model.stateUpdatedAt = model.updatedAt;
      }

      return next();
    });

    Schema.set('toObject', {
      virtuals: true,
      getters: true
    });

    Schema.set('toJSON', {
      virtuals: true,
      getters: true
    });

    Schema.plugin(jsonSelect, '-_id -__v');
    Schema.plugin(findOrCreate);
    Schema.plugin(paginate);

    return Schema;
  };

};

exports['@singleton'] = true;
