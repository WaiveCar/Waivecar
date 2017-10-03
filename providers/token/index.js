'use strict';

let bucket = Bento.Redis.bucket('verification');
let rndm   = Bento.Helpers.Random;
let error  = Bento.Error;
let md5    = require('md5');

module.exports = class Token {

  /**
   * Creates a new token and assigns the provided payload to it.
   * @param  {Object} payload
   * @param  {Number} [timer] The lifetime timer of the token; Default: 60
   * @return {String} token
   */
  static *create(payload, timer) {
    let token = generate(payload);

    let ourHash = this.hash(token, payload.id || payload.user);
    yield bucket.setJSON(ourHash, payload, 60 * (timer || 60));

    return {
      token: token,
      hash: ourHash
    };
  }

  static hash(token, id) {
    // A uuid type-5 gen in base64 to use as the salt.
    let ourSecret = 'ghBJuu5xS2i81VOXrdYs8A';
    return md5([ourSecret, token, id].join(':'));
  }

  static *getByHash(ourHash) {
    let payload = yield bucket.getJSON(ourHash);
    if (!payload) {
      throw error.parse({
        code    : 'INVALID_TOKEN',
        message : 'The provided verification token is invalid.'
      }, 400);
    }
    return payload;
  }

  static *get(token, id) {
    let ourHash = this.hash(token, id);
    return yield this.getByHash(ourHash);
  }

  /**
   * Deletes a token payload.
   * @param  {String} token The token payload to remove.
   * @return {Void}
   */
  static *delete(token) {
    yield bucket.del(token);
  }

};


/**
 * Generates a new token based on the provided payload setup.
 * @param  {Object} payload
 * @return {String}
 */
function generate(payload) {
  let length = parseInt(payload.tokenLength) || 6;

  // ### Delete Token Settings
  // Token specific settings does not belong to the payload.
  delete payload.tokenLength;

  return rndm.base10(length);
}
