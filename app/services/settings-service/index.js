
exports = module.exports = function(Setting) {

  var methods = {

    getValue: function(name, next) {
      return Setting.findOne({ name: name }, next);
    }

  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'models/setting',
];
