'use strict';

let fs    = require('co-fs');
let path  = require('path');
let Fee   = Bento.model('BookingFee');
let error = Bento.Error;
let log   = Bento.Log;

module.exports = function *() {
  let fees = JSON.parse(yield fs.readFile(path.join(Bento.MODULE_PATH, 'waivecar', 'bootstrap', 'data', 'fees.json')));

  // ### Check Count
  // Check if the db and list is the same length or if db has
  // no fees on record.

  let count = yield Fee.count();
  if (count > 0 && count === fees.length) {
    return;
  }

  // ### Import Fees

  log.debug(`Importing fees from './modules/waivecar/bootstrap/data/fees.json'`);
  
  for (let i = 0, len = fees.length; i < len; i++) {
    let fee = new Fee(fees[i]);
    yield fee.upsert();
  }
};