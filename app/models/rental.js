var _ = require('lodash');

exports = module.exports = function(EnumService, mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },

    startAt: { type: Date },

    startLocation: {
      lat: { type: Number },
      long: { type: Number }
    },

    endAt: { type: Date },

    endLocation: {
      lat: { type: Number },
      long: { type: Number }
    },

    state: { type: String, required: true, enum: _.pluck(EnumService.getRentalStateTypes(), 'name'), default: 'new' },

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Rental', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'igloo/mongo', 'lib/mongoose-plugin' ];
