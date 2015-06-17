var responseTime = require('response-time');

exports = module.exports = function() {
  return function (app){
    // adds X-Response-Time header
    app.use(responseTime({
      digits: 5
    }));
  };
};

exports['@singleton'] = true;
exports['@require'] = [ ];
