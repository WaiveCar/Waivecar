'use strict';

import config from 'config';

let facebook = module.exports = {

  /**
   * Facebook oAuth request against registration endpoints.
   * @return {Void}
   */
  register() {
    window.location.href = facebook.getLink('register');
  },

  /**
   * Facebook oAuth request against connect endpoints.
   * @return {Void}
   */
  connect() {
    window.location.href = facebook.getLink('connect');
  },

  /**
   * Facebook oAuth request against login endpoints.
   * @return {Void}
   */
  login() {
    window.location.href = facebook.getLink('login');
  },

  /**
   * Returns a facebook oAuth link based on the provided type.
   * @param  {String} type
   * @return {Void}
   */
  getLink(type) {
    let { appId, scope, redirect } = config.auth.facebook;
    return `https://www.facebook.com/dialog/oauth?client_id=${ appId }&scope=${ scope }&redirect_uri=${ redirect }/${ type }`;
  }

};
