var paginate = require('express-paginate');

exports = module.exports = function(config) {
  return function (app){

    // TODO: add config setting for default page settings.
    app.use(paginate.middleware(1, 10000));
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
