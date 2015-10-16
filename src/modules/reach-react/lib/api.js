'use strict';

import request  from 'superagent';
import storage  from 'local-storage';
import config   from 'config';
import auth     from './auth';
import { type } from './helpers';

class API {

  /**
   * Prepares the api uri.
   */
  constructor() {
    this.uri = config.api.uri + (config.api.port ? ':' + config.api.port : '');
  }

  /**
   * Submits a post request to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   * @param  {String}   role
   */
  post(uri, data, callback, role) {
    let req = this.prepare('post', uri, role);
    req.send(data);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Submits a new file upload to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   * @param  {String}   role
   */
  file(uri, data, callback, role) {
    let req      = this.prepare('post', uri, role);
    let formData = new FormData();

    // ### Append Files

    for (let key in data.files) {
      if (data.files.hasOwnProperty(key) && data.files[key] instanceof File) {
        formData.append(key, data.files[key]);
      }
    }

    for (let key in data) {
      if (key !== 'files' && data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    // ### Send Request

    req.send(formData);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Submits a new get request to the api.
   * @param  {String}   uri
   * @param  {Object}   qs
   * @param  {Function} done
   * @param  {String}   role
   */
  get(uri, qs, done, role) {
    if (!done) { role = done; done = qs; }
    let req = this.prepare('get', uri, role);
    req.query(qs);
    req.end(_handleResult.bind(this, done));
  }

  /**
   * Submits a new put request to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   * @param  {String}   role
   */
  put(uri, data, callback, role) {
    let req = this.prepare('put', uri, role);
    req.send(data);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Submits a new patch request to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   * @param  {String}   role
   */
  patch(uri, data, callback, role) {
    let req = this.prepare('patch', uri, role);
    req.send(data);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Sends a new delete request to the api.
   * @param  {String}   uri
   * @param  {Function} callback
   * @param  {String}   role
   */
  delete(uri, callback, role) {
    let req = this.prepare('delete', uri, role);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Prepares the request headers.
   * @param {String} method
   * @param {String} uri
   * @param {String} role
   */
  prepare(method, uri, role) {
    let req = request[method](this.uri + uri);
    if (auth.check()) {
      req.set('Authorization', auth.user.token);
    }
    req.set('Role', role || 'guest');
    return req;
  }

}

/**
 * Executes the callback with the err and res of the api request.
 * @param  {Function} callback
 * @param  {Object}   err
 * @param  {Object}   res
 */
function _handleResult(callback, err, res) {
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      if (auth.check()) {
        auth.logout();
      }
      window.location = '/login';
    }
    return callback({
      status  : res.status,
      code    : res.body.code,
      message : res.body.message,
      data    : res.body.data
    });
  }
  callback(null, res.body || res.text);
}

module.exports = new API();