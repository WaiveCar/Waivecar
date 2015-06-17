exports = module.exports = function(EnumService, mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    type: { type: String, lowercase: true, trim: true, enum: _.pluck(OptionsService.getTransactionTypes(), 'title'), default: 'rental' },

    amount: { type: Number, default: 100 },

    stripeData: { },

    status: { type: String, default: 'new' },

    statusReason: { type: String },

    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Transaction', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'igloo/mongo', 'lib/mongoose-plugin' ];
