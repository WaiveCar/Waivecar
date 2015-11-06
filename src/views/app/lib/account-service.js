'use strict';

import { api, auth, dom } from 'bento';
import Service            from './component-service';

module.exports = class AccountService extends Service {
  
  constructor(ctx) {
    super(ctx, 'account', {});
    this.submitPassword = this.submitPassword.bind(this);
  }

  /**
   * Send password update request to the api.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submitPassword(data, reset) {
    if (data.password !== data.passwordVerify) {
      return this.error(`Passwords does not match`);
    }
    api.put(`/users/${ auth.user.id }`, {
      password : data.password
    }, function (err) {
      if (err) {
        return this.error(err.message);
      }
      this.success(`Your password was successfully updated`);
    }.bind(this));
  }

  /**
   * Sends a license details to the api.
   * @param {Object}   data
   * @param {Function} reset
   */
  submitLicenseDetails(data, reset) {
    api.post('/licenses', data, function (err, license) {
      if (err) {
        return this.error(err.message);
      }
    });
  }

}