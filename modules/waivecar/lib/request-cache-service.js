'use strict';

let request = require('co-request');
let md5     = require('md5');
let fs = require('fs');

let CACHE = '../request-cache';
let MAXAGE = 1000 * 60 * 60 * 18;

module.exports = function*(params, opts) {
  let cache_point = `${CACHE}/${md5(JSON.stringify(params))}`;
  if (!params.method || params.method.toLowerCase() === 'get') {
    opts = opts || {};
    opts.maxAge = opts.maxAge || MAXAGE;

    // This logic is written in a way to reduce the i/o. sync
    // calls can block (in fact, they've been a problem).
    let stat = false;
    try {
      stat = fs.statSync(cache_point);
    } catch(ex) { }

    if(!stat && !fs.existsSync(CACHE)) {
      fs.mkdirSync(CACHE);
    }

    if(stat && !opts.force) {

      let age = new Date() - stat.ctime;

      // This is the only cache exit point.
      if (age < opts.maxAge) {
        return { body: fs.readFileSync(cache_point) };
      }
    } 
  }

  // If we make it to here then we are getting another copy.
  let reqResponse = yield request(params);

  fs.writeFile(cache_point, reqResponse.body);

  return { body: reqResponse.body };
};
