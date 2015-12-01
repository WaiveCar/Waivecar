'use strict';

import md5    from 'md5';
import config from 'config';

/**
 * The configurated endpoint to the API.
 * @type {String}
 */
const API_URI = config.api.uri + (config.api.port ? ':' + config.api.port : '');

module.exports = class User {

  constructor(data) {
    for (let key in data) {
      this[key] = data[key];
    }
  }

  /**
   * Returns the users full name.
   * @return {String}
   */
  getFullName() {
    return `${ this.firstName } ${ this.lastName }`;
  }

  /**
   * Returns the users avatar url location.
   * @return {String}
   */
  getAvatar() {
    let url = null;
    if (this.avatar) {
      url = `${ API_URI }/file/${ this.avatar }`;
    } else {
      url = `//www.gravatar.com/avatar/${ md5(this.email) }?s=150`;
    }
    return url;
  }

};
