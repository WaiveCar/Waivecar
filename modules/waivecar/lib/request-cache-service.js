'use strict';

let request = require('co-request');
let md5     = require('md5');
let fs      = require('fs');
let Redis   = require('./redis-service.js');

module.exports = function*(params, opts) {
  let doCache = false;
  let key = ['CACHE', md5(JSON.stringify(params))].join(':');

  if (!params.method || params.method.toLowerCase() === 'get') {
    // This logic is written in a way to reduce the i/o. sync
    // calls can block (in fact, they've been a problem).
    let body = yield Redis.get(key);

    if(body !== null) {
      return { body: body };
    } 
    doCache = true;
  }

  // If we make it to here then we are getting another copy.
  let reqResponse = yield request(params);

  if(doCache) {
    // timeout is in miliseconds
    yield Redis.set(key, reqResponse.body, 'nx', 'px', 1000 * 3600 * 18);
  }

  return { body: reqResponse.body };
};
