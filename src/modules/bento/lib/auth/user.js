import md5    from 'md5';
import config from 'config';

const apiUrl = config.api.uri + (config.api.port ? ':' + config.api.port : '');

module.exports = class User {

  constructor(data, roles) {
    this._roles = roles;
    for (let key in data) {
      this[key] = data[key];
    }
    this.isWaiveAdmin = this.hasAccess('admin') && !(data.organizations && data.organizations.length);
  }

  /**
   * Returns a boolean if the user has access based on provided role.
   * @param  {String}  role
   * @return {Boolean}
   */
  hasAccess(role) {
    if (role === 'waiveAdmin') {
      return this.isWaiveAdmin;
    }
    let check = this._roles.find(val => val.name === role);
    let auth  = this._roles.find(val => val.name === this.role.name);

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
