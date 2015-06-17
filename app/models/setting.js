exports = module.exports = function(mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    name: { type: String, lowercase: true, trim: true, required: true, unique: true, index: true },

    description: { type: String, trim: true, required: true },

    value: { type: String, required: true }

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Setting', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'lib/mongoose-plugin' ];
