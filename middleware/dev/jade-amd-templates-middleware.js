var jadeAmd = require('jade-amd');

exports = module.exports = function(config) {
  return function (app){
    app.use(config.jade.amd.path, jadeAmd.jadeAmdMiddleware(config.jade.amd.options));
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
