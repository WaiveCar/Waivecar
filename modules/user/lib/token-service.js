'use strict';

let bucket = Bento.Redis.bucket('user:token');
let rndm   = Bento.Helpers.Random;
let error  = Bento.Error;

module.exports = class TokenService {

  /**
   * Generates, stores, and returns a token.
   * @param  {Object} payload
   * @return {String} token
   */
  static *create(payload) {
    let token = rndm.base10(4);
    yield bucket.setJSON(token, payload, 60 * 60);
    return token;
  }

  /**
   * Returns user id based on the token provided.
   * @param  {String} token
   * @return {Object} payload
   */
  static *get(token) {
    let payload = yield bucket.getJSON(token);
    if (!payload) {
      throw error.parse({
        code    : `TOKEN_INVALID`,
        message : `The provided token is invalid`
      }, 400);
    }
    return payload;
  }

  /**
   * Deletes a token from the redis store.
   * @param  {String} token
   */
  static *delete(token) {
    yield bucket.del(token);
  }

};
