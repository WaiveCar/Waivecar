var helmet = require('helmet');
var cors = require('cors');

exports = module.exports = function(IoC, config) {

  var app = this;
  app.use(cors());

  // var allowCrossDomain = function(req, res, next) {
  //     res.header('Access-Control-Allow-Origin', '*');
  //     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  //     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  //     // intercept OPTIONS method
  //     if ('OPTIONS' == req.method) {
  //       res.send(200);
  //     }
  //     else {
  //       next();
  //     }
  // };

  // app.use(allowCrossDomain);




  // app.use(corser.create({
  //   supportsCredentials: true,
  //   requestHeaders: corser.simpleRequestHeaders.concat([ 'Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'X-Requested-With' ])
  // }));

  // trust proxy
  if (config.trustProxy) app.enable('trust proxy');

  // use helmet for security
  app.use(helmet());
};

exports['@require'] = [ '$container', 'igloo/settings' ];
