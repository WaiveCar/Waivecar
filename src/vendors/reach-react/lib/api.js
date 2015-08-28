'use strict';

let request = require('superagent');
let storage = require('local-storage');
let auth    = require('./auth');
let config  = require('../../../config');
let api     = config.api.uri + ':' + config.api.port;

/**
 * @class API
 */
let API = module.exports = {};

/**
 * @method get
 * @param  {String}   uri
 * @param  {Object}   [qs]
 * @param  {Function} [callback]
 */
API.get = function (uri, qs, callback) {
  if (typeof qs === 'function') {
    callback = qs;
    qs       = {};
  }
  let req = request.get(api + uri);
  req.query(qs);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method post
 * @param  {String}   url
 * @param  {Object}   data
 * @param  {Function} callback
 */
API.post = function (uri, data, callback) {
  let req = request.post(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.send(data);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method put
 * @param  {String}   uri
 * @param  {Object}   data
 * @param  {Function} [callback]
 */
API.put = function (uri, data, callback) {
  let req = request.put(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.send(data);
  req.end(_handleResult.bind(this, callback));
};

/**
 * @method delete
 * @param  {String}   uri
 * @param  {Function} [callback]
 */
API.delete = function (uri, callback) {
  let req = request.del(api + uri);
  if (auth.check()) {
    req.set('Authorization', auth.user.token);
  }
  req.end(_handleResult.bind(this, callback));
};

/**
 * @private
 * @method _handleResult
 */
function _handleResult(callback, err, res) {
  if (!res.ok) {
    if (res.status === 401) {
      storage.remove('auth');
      window.location = '/#/login';
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