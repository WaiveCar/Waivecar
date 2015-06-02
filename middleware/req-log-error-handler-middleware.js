exports = module.exports = function() {
  return function (app){
    // prepare req.log for error handler
    app.use(function(req, res, next) {
      req.log = {
        response_time: new Date().getTime(),
        path: req.path,
        query: req.query,
        body: req.body,
        params: req.params
      };
      next();
    });
  };
};

exports['@singleton'] = true;
exports['@require'] = [];
