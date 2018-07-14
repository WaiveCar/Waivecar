'use strict';

let error = Bento.Error;
let log   = Bento.Log;

module.exports = function(app) {
  app.use(function *(next) {
    try {
      yield next;
    } catch (err) {
      let route = null;

      // ### Route
      // If the route path exists we add it, this may be empty if
      // the system errors out before the router has been executed

      if (this.route !== undefined) {
        route = `${ this.method } ${ this.route }`;
      }

      // ### Custom Handler
      // Check if a custom handler has been registered for the route

      if (error.handlers[route] !== undefined) {
        err = error.handlers[route](err);
      }

      this.status = err.httpStatus || 500;

      let response = Object.assign({}, err);
      response.code = response.code || response.type;

      // ### Error
      // Logs error to console including the requesters IP and ID

      if (this.status === 500) {

        // ### Log Error

        log.error(Object.assign(response, {
          route : route,
          uri   : `${ this.method } ${ this.path }`,
          stack : err.stack
        }));

        // ### Return Error

        this.body = Object.assign({
          code    : 'INTERNAL_SERVER_ERROR',
          message : 'An internal error occured in the service',
        }, response);

      } else if (this.status === 501) {
        log.debug(`${ err.httpStatus } > ${ err.message }`);
        this.body = {
          code    : 'NOT_IMPLEMENTED',
          message : 'This service is currently not supporting this request'
        };
      } else {
        log.debug(`${ err.httpStatus } > ${ err.message }`);
        this.body = response;
      }
    }
  });
};
