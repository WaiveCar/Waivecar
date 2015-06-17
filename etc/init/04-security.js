var helmet = require('helmet');
var cors = require('cors');

exports = module.exports = function(IoC, config) {

  var app = this;

  app.use(cors({
    credentials: true
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
