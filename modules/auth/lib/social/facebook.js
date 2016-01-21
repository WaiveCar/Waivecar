'use strict';

let request    = require('co-request');
let error      = Bento.Error;
let changeCase = Bento.Helpers.Case;

module.exports = class Facebook {

  /**
   * Fetches a profile based on the code and accessToken provided
   * @param  {String} accessToken
   * @return {Object}
   */
  *getProfile(accessToken, fields) {
    let res    = yield request({
      url : 'https://graph.facebook.com/v2.4/me',
      qs  : changeCase.objectKeys('toSnake', {
        accessToken : accessToken,
        fields      : fields
      }),
      json : true
    });
    if (res.statusCode !== 200) {
      throw error.parse({
        code    : `FB_PROFILE_ERROR`,
        message : res.body.error.message
      }, res.statusCode);
    }
    return res.body;
  };

};
