'use strict';

let bucket = Bento.Redis.bucket('verification');
let rndm   = Bento.Helpers.Random;
let error  = Bento.Error;

module.exports = class Token {

  /**
   * Creates a new token and assigns the provided payload to it.
   * @param  {Object} payload
   * @param  {Number} [timer] The lifetime timer of the token; Default: 60
   * @return {String} token
   */
  static *create(payload, timer) {
    let token = generate(payload);

    // ### Store Token
    // Stores the token and its payload in the verification bucket

    yield bucket.setJSON(token, payload, 60 * (timer || 60));

    return token;
  }

  /**
   * Retrieves a token from the token store.
   * @param  {String} token
   * @return {Object}
   */
  static *get(token) {
    let payload = yield bucket.getJSON(token);
    if (!payload) {
      throw error.parse({
        code    : 'INVALID_TOKEN',
        message : 'The provided verification token is invalid.'
      }, 400);
    }
    return payload;
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
  let type   = payload.tokenType;
  let length = parseInt(payload.tokenLength) || 12;

  // ### Delete Token Settings
  // Token specific settings does not belong to the payload.

  delete payload.tokenType;
  delete payload.tokenLength;

  switch (type) {
    case 'base10' : return rndm.base10(length);
    case 'base32' : return rndm.base32(length);
    case 'base64' : return rndm.base64(length);
    default       : return rndm(length);
  }
}
