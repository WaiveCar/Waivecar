var _ = require('lodash');

exports = module.exports = function(mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({
    content:{ type: String },
    createdAt:{type: Date, default: Date.now},
  });
  Model.plugin(mongoosePlugin);
  return mongoose.model('stripeEvent', Model,'stripeEvents');
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/mongo', 'lib/mongoose-plugin' ];
