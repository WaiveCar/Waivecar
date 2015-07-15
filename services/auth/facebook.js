/**
  Facebook
  ========
  @author  Christoffer Rødvik (c) 2015
  @license MIT
 */

'use strict';

// ### Dependencies

var request = require('koa-request');

// ### Module

module.exports = (function () {

  /**
   * @class Facebook
   */
  function Facebook(config) {
    this.accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
    this.graphiApiUrl   = 'https://graph.facebook.com/v2.3/me';
    this.appId          = config.appId;
    this.appSecret      = config.appSecret;
  }

  /**
   * Fetches a profile based on the code and accessToken provided
   * @method profile
   * @param {string} accessToken
   */
  Facebook.prototype.profile = function *(accessToken) {
    var res = yield request({
      url  : this.graphiApiUrl,
      qs   : accessToken,
      json : true
    });
    return res.body;
  };

  /**
   * Generates a facebook accessToken
   * @param {string} code
   * @param {string} redirectUrl
   */
  Facebook.prototype.accessToken = function *(code, redirectUrl) {
    var res = yield request({
      url : this.accessTokenUrl,
      qs  : {
        code          : code,
        client_id     : this.appId,
        client_secret : this.appSecret,
        redirect_uri  : redirectUrl
      },
      json : true
    });
    return res.body;
  };

  return Facebook;

})();