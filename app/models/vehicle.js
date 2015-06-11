var _ = require('lodash');

exports = module.exports = function(EnumService, mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    vin: { type: String, trim: true, required: true, unique: true, index: true },

    make: { type: String, trim: true, required: true },

    model: { type: String, trim: true, required: true },

    year: { type: Number, required: true },

    manufacturer: { type: String, trim: true, required: true },

    location: {
      lat: { type: Number },
      long: { type: Number }
    },

    diagnostics: { },
      // fuel: {
      //   capacity,
      //   level,
      //   levelInGal
      // }

    state: { type: String, required: true, enum: _.pluck(EnumService.getVehicleStateTypes(), 'name'), default: 'available' },

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Vehicle', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'igloo/mongo', 'lib/mongoose-plugin' ];
