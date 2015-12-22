import md5    from 'md5';
import config from 'config';

let apiUrl   = config.api.uri + (config.api.port ? ':' + config.api.port : '');
let apiRoles = [];

module.exports = class User {

  constructor(data, roles) {
    apiRoles = roles;
    for (let key in data) {
      this[key] = data[key];
    }
  }

  /**
   * Returns a boolean if the user has access based on provided role.
   * @param  {String}  role
   * @return {Boolean}
   */
  hasAccess(role) {
    let check = apiRoles.find(val => val.name === role);
    let auth  = apiRoles.find(val => val.name === this.role.name);

    // ### Access Check
    // If provided role is less than authenticated role we have access.

    return check.position <= auth.position;
  }

  /**
   * Returns the users full name.
   * @return {String}
   */
  getName() {
    return `${ this.firstName } ${ this.lastName }`;
  }

  /**
   * Returns the users avatar url location.
   * @return {String}
   */
  getAvatar() {
    let url = null;
    if (this.avatar) {
      url = `${ apiUrl }/file/${ this.avatar }`;
    } else {
      url = `//www.gravatar.com/avatar/${ md5(this.email) }?s=150`;
    }
    return url;
  }

};
