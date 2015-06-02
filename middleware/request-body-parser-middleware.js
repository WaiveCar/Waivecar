var bodyParser = require('body-parser');
var methodOverride = require('method-override');

exports = module.exports = function() {
  return function (app){
    // parse request bodies
    // support _method (PUT in forms etc)
    app.use(
      bodyParser.json(),
      bodyParser.urlencoded({
        extended: true
      }),
      methodOverride('_method')
    );
  };
};

exports['@singleton'] = true;
exports['@require'] = [];
