var lessMiddleware = require('less-middleware');

exports = module.exports = function(config) {
  return function (app){
    app.use(lessMiddleware(config.less.path, config.less.options));
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
