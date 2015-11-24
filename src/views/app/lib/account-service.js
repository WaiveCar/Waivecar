'use strict';

import { api, auth, dom } from 'bento';
import Service            from './component-service';

module.exports = class AccountService extends Service {

  constructor(ctx) {
    super(ctx, 'account', {
      status : []
    });
    this.submitPassword = this.submitPassword.bind(this);
    this.submitUser = this.submitUser.bind(this);
  }

  /**
   * Creates a verification status list and adds it to the account state.
   */
  status(id) {
    this.setState('status', [
      { type : 'Email Verified',   isValid : false },
      { type : 'Phone Verified',   isValid : false },
      { type : 'Payment Card',     isValid : false },
      { type : 'License Provided', isValid : false },
      { type : 'License Cleared',  isValid : false }
    ]);
    this.setGeneralStatus();
    this.setPaymentStatus();
    this.setLicenseStatus();
  }

  /**
   * Pulls down account profile of the provided user and sets the status
   * of the email and phone verification.
   */
  setGeneralStatus() {
    api.get(`/users/${ auth.user().id }`, function(err, user) {
      if (err) {
        return this.error(err.message);
      }
      this.setState('status', this.getState('status').map((status) => {
        switch (status.type) {
          case 'Email Verified' : return {
            type    : 'Email Verified',
            isValid : user.verifiedEmail
          };
          case 'Phone Verified' : return {
            type    : 'Phone Verified',
            isValid : user.verifiedPhone
          };
          default : return status;
        }
      }));
    }.bind(this));
  }

  /**
   * Sets the payment status by verifying that a valid card has been
   * registered with the account.
   */
  setPaymentStatus() {
    api.get('/payments/cards', function (err, cards) {
      if (err) {
        return this.error(err.message);
      }
      if (cards.length) {
        this.setState('status', this.getState('status').map((status) => {
          switch (status.type) {
            case 'Payment Card' : return {
              type    : 'Payment Card',
              isValid : true
            };
            default : return status;
          }
        }));
      }
    }.bind(this));
  }

  /**
   * Sets the license status for the account.
   */
  setLicenseStatus() {
    api.get('/licenses', function (err, licenses) {
      if (err) {
        return this.error(err.message);
      }
      if (licenses.length) {
        this.setState('status', this.getState('status').map((status) => {
          switch (status.type) {
            case 'License Provided' : return {
              type    : 'License Provided',
              isValid : true
            };
            default : return status;
          }
        }));
        if (licenses[0].status === 'clear') {
          this.setState('status', this.getState('status').map((status) => {
            switch (status.type) {
              case 'License Cleared' : return {
                type    : 'License Cleared',
                isValid : true
              };
              default : return status;
            }
          }));
        }
      }
    }.bind(this));
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
   * Send password update request to the api.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submitUser(data, reset) {
    api.put(`/users/${ auth.user().id }`, {
      firstName : data.firstName,
      lastName  : data.lastName,
      email     : data.email,
      phone     : data.phone
    }, (err) => {
      if (err) {
        return this.error(err.message);
      }
      this.success(`Your details have been successfully updated`);
    });
  }

}
