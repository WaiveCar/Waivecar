'use strict';

import { api, auth } from 'bento';
import { snackbar }  from 'bento-web';
import types         from 'bento/lib/helpers/type';
import config        from 'config';

let facebook = module.exports = {

  /**
   * Facebook oAuth request against registration endpoints.
   * @param  {Function} [errorHandler]
   * @return {Void}
   */
  register(errorHandler) {
    if (facebook.hasToken()) {
      api.post('/auth/facebook', {
        type   : 'register',
        token  : facebook.getToken(),
        fields : 'first_name,last_name,email'
      }, (error, user) => {
        if (error) {
          switch (error.code) {
            case 'FB_ID_EXISTS'    : facebook.login(errorHandler);   break;
            case 'FB_EMAIL_EXISTS' : console.log('FB_EMAIL_EXISTS'); break;
            default : {
              if (types.isFunction(errorHandler)) {
                return errorHandler(error);
              }
              facebook.error(error.message);
            }
          }
          return;
        }
        facebook.setAuth(user);
      });
    } else {
      window.location.href = facebook.getLink('register');
    }
  },

  /**
   * Facebook oAuth request against connect endpoints.
   * @param  {Function} [errorHandler]
   * @return {Void}
   */
  connect(errorHandler) {
    if (facebook.hasToken()) {
      api.post('/auth/facebook', {
        type   : 'connect',
        token  : facebook.getToken(),
        fields : 'first_name,last_name,email'
      }, (error) => {
        if (error) {
          if (types.isFunction(errorHandler)) {
            return errorHandler(error);
          }
          return facebook.error(error.message);
        }
        window.location.href = '/profile';
      });
    } else {
      window.location.href = facebook.getLink('connect');
    }
  },

  /**
   * Facebook oAuth request against login endpoints.
   * @param  {Function} [errorHandler]
   * @return {Void}
   */
  login(errorHandler) {
    if (facebook.hasToken()) {
      api.post('/auth/facebook', {
        type   : 'login',
        token  : facebook.getToken(),
        fields : 'first_name,last_name,email'
      }, (error, user) => {
        if (error) {
          if (types.isFunction(errorHandler)) {
            return errorHandler(error);
          }
          return facebook.error(error.message);
        }
        facebook.setAuth(user);
      });
    } else {
      window.location.href = facebook.getLink('login');
    }
  },

  /**
   * Returns a facebook oAuth link based on the provided type.
   * @param  {String} type
   * @return {Void}
   */
  getLink(type) {
    let { appId, scope, redirect } = config.auth.facebook;
    return `https://www.facebook.com/dialog/oauth?client_id=${ appId }&response_type=token&scope=${ scope }&redirect_uri=${ redirect }/${ type }`;
  },

  /**
   * Snackbar error popup.
   * @param  {String} message
   * @return {Void}
   */
  error(message) {
    snackbar.notify({
      type    : 'danger',
      message : message
    });
  },

  // ### Authorization Methods

  /**
   * Stores the authenticated user and pushes a new state.
   * @param {[type]} user [description]
   */
  setAuth(user) {
    auth.set(user);
    window.location.href = '/'; // Hopefully a better way to do this with react-router?
  },

  // ### Token Methods

  /**
   * Stores the token located in the current url.
   * @return {Void}
   */
  setToken() {
    let hash  = window.location.hash.substr(1);
    let token = hash.substr(hash.indexOf('access_token=')).split('&')[0].split('=')[1];
    sessionStorage.setItem('fb_token', token);
  },

  /**
   * Returns boolean state on the facebook access_token.
   * @return {Boolean}
   */
  hasToken() {
    return sessionStorage.fb_token ? true : false;
  },

  /**
   * Returns the facebook access_token
   * @return {String}
   */
  getToken() {
    return sessionStorage.fb_token;
  }

};
