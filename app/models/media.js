var _ = require('lodash');
var moment = require('moment');

exports = module.exports = function(EnumService, PubSubService, mongoose, mongoosePlugin, logger) {

  var Model = new mongoose.Schema({

    type: { type: String, lowercase: true, trim: true, enum: _.pluck(EnumService.getMediaTypes(), 'name'), default: 'unknown', required: true },

    location: { type: String },

    filename: { type: String, required: true },

    thumbnail: { type: String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    state: { type: String, required: true, enum: _.pluck(EnumService.getStateTypes(), 'name'), default: 'active' }

  });

  Model.pre('save', function(next) {
    var model = this;
    return next();
  });

  Model.post('save', function(model) {
    //TODO: find a better way to determine isNew.
    if (moment(model.createdAt).isSame(model.updatedAt, 'second')) {
      logger.debug(model.id + ': publishing add');
      PubSubService.publishAdd('media', model);
    } else {
      logger.debug(model.id + ': publishing update');
      PubSubService.publishUpdate('media', model);
    }

  });

  Model.post('remove', function(model) {
    PubSubService.publishRemove('media', model);
  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Media', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'services/pubsub-service', 'igloo/mongo', 'lib/mongoose-plugin', 'igloo/logger' ];
