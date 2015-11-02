let assert = require('assert');
let base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';
let base10 = '0123456789';

/**
 * @class Random
 */
let Random = module.exports = create(base62);

/**
 * @property base62
 * @type     Function
 */
Random.base62 = Random;

/**
 * @property base36
 * @type     Function
 */
Random.base36 = create(base36);

/**
 * @property base10
 * @type     Function
 */
Random.base10 = create(base10);

/**
 * @private
 * @method create
 * @param  {String} chars
 */
function create(chars) {
  assert(typeof chars === 'string');
  let length = Buffer.byteLength(chars);
  return function rndm(len) {
    assert(typeof len === 'number' && len >= 0);
    let salt = '';
    for (let i = 0; i < len; i++) {
      salt += chars[Math.floor(length * Math.random())];
    }
    return salt;
  }
}

