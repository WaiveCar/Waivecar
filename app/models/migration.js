exports = module.exports = function(mongoose, mongoosePlugin) {

  var Model = new mongoose.Schema({

    name: { type: String, trim: true, required: true, unique: true, index: true }

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('Migration', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'lib/mongoose-plugin' ];
