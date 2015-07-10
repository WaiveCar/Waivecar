var helmet = require('helmet');
var cors = require('cors');
var _ = require('lodash');

exports = module.exports = function(IoC, config) {

  var app       = this;
  var whitelist = config.origins.whitelist;

  app.use(cors({
    credentials: true,
    origin: function(origin, callback){
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      if (_.contains(whitelist, '*')) originIsWhitelisted = true;
      callback(null, originIsWhitelisted);
    }
  }));

  app.use(function (req, res, next) {
    var list   = config.origins.list;
    var origin = req.headers.origin;

    if (list.hasOwnProperty(origin)) {
      req.from = list[origin];
    } else {
      req.from = null;
    }

    next();
  });

  // trust proxy
  if (config.trustProxy) app.enable('trust proxy');

  // use helmet for security
  app.use(helmet());
};

exports['@require'] = [ '$container', 'igloo/settings' ];
