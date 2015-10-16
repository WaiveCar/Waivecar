'use strict';

import request  from 'superagent';
import storage  from 'local-storage';
import config   from 'config';
import auth     from './auth';
import { type } from './helpers';

/**
 * @class API
 */
let API = module.exports = {};

/**
 * @property api
 * @type     String
 */
let api = config.api.uri + (config.api.port ? ':' + config.api.port : '');

/**
 * @method get
 * @param  {String}   uri
 * @param  {Object}   [qs]
 * @param  {Function} [done]
 * @param  {String}   [role]
 */
API.get = function (uri, qs, done, role) {
  let req = request.get(api + uri);
  if (type.isFunction(qs)) {
    done = qs;
    qs   = {};
  }
  req.query(qs);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  req.end(_handleResult.bind(this, done));
};

/**
 * @method post
 * @param  {String}   url
 * @param  {Object}   data
 * @param  {Function} callback
 * @param  {String}   [role]
 */
API.post = function (uri, data, callback, role) {
  let req = request.post(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  req.send(data);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method post
 * @param  {String}   url
 * @param  {Object}   data
 * @param  {Function} callback
 * @param  {String}   [role]
 */
API.file = function (uri, data, callback, role) {
  let req = request.post(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  let formData = new FormData();
  for (var key in data.files) {
    if (data.files.hasOwnProperty(key) && data.files[key] instanceof File) {
      formData.append(key, data.files[key]);
    }
  }
  for (var key in data) {
    if (key !== 'files' && data.hasOwnProperty(key)) {
      formData.append(key, data[key]);
    }
  }
  req.send(formData);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method put
 * @param  {String}   uri
 * @param  {Object}   data
 * @param  {Function} [callback]
 * @param  {String}   [role]
 */
API.put = function (uri, data, callback, role) {
  let req = request.put(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  req.send(data);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method patch
 * @param  {String}   uri
 * @param  {Object}   data
 * @param  {Function} [callback]
 * @param  {String}   [role]
 */
API.patch = function (uri, data, callback, role) {
  let req = request.patch(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  req.send(data);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method delete
 * @param  {String}   uri
 * @param  {Function} [callback]
 * @param  {String}   [role]
 */
API.delete = function (uri, callback, role) {
  let req = request.del(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.set('Role', role || 'guest');
  req.end(_handleResult.bind(this, callback));
};

/**
 * @private
 * @method _handleResult
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
  callback(null, res.body);
}