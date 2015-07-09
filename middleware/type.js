/**
  Type
  ====

  Resolve the type of application that is contact the API, this is usefull for when we want to
  know how to handle certain requests. It might be a public user based application or an admin
  site.

  This middleware looks at the origin of the request and determines the type of application the
  request is coming from.

  @author  Christoffer Rødvik (C) 2015
  @license MIT
 */

'use strict';

// ### Middleware

module.exports = function (app) {
  app.use(function *(next) {
    var origin = this.headers.origin;
    var types  = reach.config.api.sites;

    this.from = null;

    for (var key in types) {
      if (types.hasOwnProperty(key)) {
        if (-1 !== types[key].indexOf(origin)) {
          this.from = key;
          break;
        }
      }
    }

    yield next;
  });
};