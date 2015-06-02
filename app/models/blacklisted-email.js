var validator = require('validator');
exports = module.exports = function(mongoose, mongoosePlugin) {

  var validations = {
    email: [ validator.isEmail, 'Email is not a valid address' ]
  };

  var Model = new mongoose.Schema({

    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true, validate: validations.email },

  });

  Model.plugin(mongoosePlugin);
  return mongoose.model('BlacklistedEmail', Model);
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/mongo', 'lib/mongoose-plugin' ];
