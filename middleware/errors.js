'use strict';

let shortid = require('shortid');
let error   = Bento.Error;
let event   = Bento.Event;

// ### Constants

const ERROR = 'error';
const WARN  = 'warn';
const DEBUG = 'debug';

// ### Export

module.exports = function (app) {
  app.use(function *(next) {
    try {
      yield next;
    } catch (err) {
      let response = err;
      let errorId  = shortid.generate();
      let uri      = `${ this.method } ${ this.path }`;
      let route    = null;
      let ip       = this.request.ip.split(':');
      let stack    = err.stack || null;

      // ### Route
      // If the route path exists we add it, this may be empty if
      // the system errors out before the router has been executed

      if (this.route !== undefined) {
        route = `${ this.method } ${ this.route }`;
      }

      // ### Custom Handler
      // Check if a custom handler has been registered for the route

      if (error.handlers[route] !== undefined) {
        response = error.handlers[route](response);
      }

      // ### Status
      // Set the error response status

      this.status = response.status || 500;

      // ### Prepare Error
      // Prepares the error response for display.

      response = {
        code     : response.code || response.type,
        message  : response.message,
        solution : response.solution,
        data     : response.data || {}
      };

      // ### Error Meta
      // Prepare the error details to be handled.

      let meta = {
        id   : errorId,
        from : {
          id    : (this.user) ? this.user.id : 'GUEST',
          ip    : ip[ip.length - 1]
        },
        details : {
          uri      : uri,
          route    : route,
          code     : response.code,
          message  : response.message,
          solution : response.solution,
          data     : response.data
        },
        stack : stack
      };

      // ### Error
      // Logs error to console including the requesters IP and ID

      if (this.status === 500) {

        // ### Log Error
        // Emits a koa log event and prints the error to the api console.

        event.emit('log:koa', errorMeta);
        error.log(ERROR, this.status + ' INTERNAL SERVER ERROR', meta);

        this.body = {
          code    : 'INTERNAL_SERVER_ERROR',
          message : 'An internal error occured in the service',
          data    : {
            id : errorId
          }
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