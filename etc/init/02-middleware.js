var _ = require('lodash');

exports = module.exports = function (
  config, authMiddleware, winstonMiddleware, reqLogErrorMiddleware, reqBodyParserMiddleware,
  responseTimeMiddleware, serveFaviconMiddleware, serveStaticMiddleware,
  jadeDevMiddleware, lessDevMiddleware
  ) {

  var app = this;

  var middlewares = [
    serveFaviconMiddleware,
    serveStaticMiddleware,
    authMiddleware,
    responseTimeMiddleware,
    reqLogErrorMiddleware,
    winstonMiddleware,
    reqBodyParserMiddleware,
  ];

  var devMiddlewares = [ jadeDevMiddleware, lessDevMiddleware ];

  if (config.server.env === 'development') {
    _.map(devMiddlewares, function(middleware){
      middleware(app);
    });
  }

  _.map(middlewares, function(middleware){
    middleware(app);
  });
};

exports['@require'] = [
  'igloo/settings',
  'middleware/auth-middleware',
  'middleware/winston-middleware',
  'middleware/req-log-error-handler-middleware',
  'middleware/request-body-parser-middleware',
  'middleware/response-time-middleware',
  'middleware/serve-favicon-middleware',
  'middleware/serve-static-middleware',
  'middleware/dev/jade-amd-templates-middleware',
  'middleware/dev/less-middleware'
];
