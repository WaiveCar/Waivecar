'use strict';

let request = require('co-request');
let md5     = require('md5');
let fs      = require('fs');
let Redis   = require('./redis-service.js');

module.exports = function*(params, opts) {
  let cache_point = JSON.stringify(params);

  if (!params.method || params.method.toLowerCase() === 'get') {
    // This logic is written in a way to reduce the i/o. sync
    // calls can block (in fact, they've been a problem).
    let body = yield Redis.hget('cache', cache_point);

    if(body !== null) {
      return { body: body };
    } 
  }

  // If we make it to here then we are getting another copy.
  let reqResponse = yield request(params);

  yield Redis.hset('cache', cache_point, reqResponse.body);

  return { body: reqResponse.body };
};
