'use strict';

let bcrypt = require('bcryptjs');

module.exports = class BCryptWrapper {

  /**
   * @param  {Number} rounds
   * @param  {Number} seedLength
   * @return {String}
   */
  static genSalt(rounds, seedLength) {
    return (done) => {
      bcrypt.genSalt(rounds, seedLength, done);
    };
  }

  /**
   * @param  {String} s
   * @param  {String} salt
   * @return {String}
   */
  static hash(s, salt) {
    return (done) => {
      bcrypt.hash(s, salt, done);
    };
  }

  /**
   * @param  {String} s
   * @param  {String} hash
   * @return {Boolean}
   */
  static compare(s, hash) {
    return (done) => {
      bcrypt.compare(s, hash, done);
    };
  }

};
