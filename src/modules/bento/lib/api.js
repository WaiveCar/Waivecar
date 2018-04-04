import request  from 'superagent';
import storage  from 'local-storage';
import config   from 'config';
import auth     from './auth';
import { type } from './helpers';

/**
 * The configurated endpoint to the API.
 * @type {String}
 */
const API_URI = config.api.uri + (config.api.port ? ':' + config.api.port : '');

// ### API

class API {

  /**
   * Submits a post request to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   */
  static post(uri, data, callback) {
    let req = this.prepare('post', uri);
    req.send(data);
    if(self._debug) {
      console.log("POST " + uri, data);
    }
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Submits a new file upload to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   */
  static file(uri, data, callback) {
    let req      = this.prepare('post', uri);
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
   */
  static get(uri, qs, done) {
    if (typeof qs === 'function') {
      done = qs;
      qs   = {};
    }

    let req = this.prepare('get', uri);
    req.query(qs);
    if(self._debug) {
      console.log("GET " + uri, qs);
    }
    req.end(_handleResult.bind(this, done));
  }

  static put(uri, data, callback) {
    let req = this.prepare('put', uri);
    req.send(data);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Submits a new patch request to the api.
   * @param  {String}   uri
   * @param  {Object}   data
   * @param  {Function} callback
   */
  static patch(uri, data, callback) {
    let req = this.prepare('patch', uri);
    req.send(data);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Sends a new delete request to the api.
   * @param  {String}   uri
   * @param  {Function} callback
   */
  static delete(uri, callback) {
    let req = this.prepare('del', uri);
    req.end(_handleResult.bind(this, callback));
  }

  /**
   * Prepares the request headers.
   * @param {String} method
   * @param {String} uri
   */
  static prepare(method, uri) {
    let req   = request[method](API_URI + uri);
    let token = auth.token();
    if (token) {
      req.set('Authorization', token);
    }
    return req;
  }

  static external(uri, qs, done) {
    let req = request.get(uri);
    req.query(qs);
    req.end(_handleResult.bind(this, done));
  }

};

API.uri = API_URI;

/**
 * Executes the callback with the err and res of the api request.
 * @param  {Function} callback
 * @param  {Object}   err
 * @param  {Object}   res
 */
function _handleResult(callback, err, res, isExternal) {
  if (!res) {
    return callback({
      status  : 500,
      code    : `INTERNAL_SERVICE_ERROR`,
      message : `An internal application service error occured during the request.`,
      data    : err
    });
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      if (!isExternal) {
        auth.logout();
        window.location = '/';
      }
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

module.exports = API;
