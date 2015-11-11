'use strict';

let error = Bento.Error;
let log   = Bento.Log;

module.exports = function (app) {
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

      // ### Status
      // Set the error response status

      this.status = err.status || 500;

      // ### Prepare Error
      // Prepares the error response for display.

      let response = {
        code     : err.code || err.type,
        message  : err.message,
        solution : err.solution,
        data     : err.data || null
      };

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

        this.body = {
          code    : 'INTERNAL_SERVER_ERROR',
          message : 'An internal error occured in the service',
        };

      } else if (this.status === 501) {
        this.body = {
          code    : 'NOT_IMPLEMENTED',
          message : 'This service is currently not supporting this request'
        };
      } else {
        this.body = response;
      }
    }
  });
};
