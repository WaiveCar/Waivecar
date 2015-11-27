'use strict';

import { api, auth, dom, helpers } from 'bento';
import Service                     from './component-service';
import async                       from 'async';

module.exports = class License extends Service {

  /**
   * Stores the provided context.
   * @param {Object} ctx
   */
  constructor(ctx) {
    super(ctx, 'license', {
      licenses : []
    });
    this.submitLicense = this.submitLicense.bind(this);
    this.validateLicense = this.validateLicense.bind(this);
    this.deleteLicense = this.deleteLicense.bind(this);
  }

  /**
   * Form submission method for bento-web form component.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submitLicense(data, reset) {
    this.addLicense(auth.user(), data, function (err, license) {
      if (err) {
        return this.error(err.data ? err.data : err.message);
      }

      this.setState('licenses', [
        ...this.getState('licenses'),
        license
      ]);
      this.success(`Your license was added successfully. We will validate it at time of booking.`);
      reset();
    }.bind(this));
  }

  validateLicense() {
    api.post(`/licenses/${ this.getState('licenses')[0].id }/verify`, { userId : auth.user().id }, function(err, resp) {
      if (err) {
        if (err.data) {
          return this.error(err.data);
        }
        return this.error(err.message);
      }
      done(license);
    }.bind(this));
  }

  /**
   * Adds a new license under the provided user.
   * @param {Object}   user
   * @param {Object}   license
   * @param {Function} done
   */
  addLicense(user, license, done) {
    async.each([ 'state', 'number', 'birthDate', 'lastName', 'firstName' ], function(field, next) {
      let currentValue = license.hasOwnProperty(field) ? license[field] : undefined;
      let valueName = helpers.changeCase.toSentence(field);
      if (!currentValue) {
        let message = `A ${ valueName } is required.`;
        return next(new Error(message));
      } else {
        return next();
      }
    }, function(err) {
      if (err) {
        return done(err);
      }

      api.post('/licenses', {
        userId     : user.id,
        firstName  : license.firstName,
        middleName : license.middleName,
        lastName   : license.lastName,
        birthDate  : new Date(license.birthDate.split('/')),
        gender     : license.gender,
        state      : license.state,
        number     : license.number
      }, function (err, license) {
        if (err) {
          return done(err);
        }
        return done(license);
      }.bind(this));
    });
  }

  /**
   * Loads licenses from the api and adds them to the array on the ctx.
   */
  setLicenses() {
    api.get('/licenses', function (err, cards) {
      if (err) {
        return this.error(err.message);
      }
      this.setState('licenses', cards);
    }.bind(this));
  }

  /**
   * Deletes a license and updates the array on the ctx.
   * @param {String} licenseId
   */
  deleteLicense(licenseId) {

    // ### Hide Button
    // If a delete button has been defined we hide the button while processing
    // the delete request.

    let btn = this.getRefs(`delete-license-${ licenseId }`);
    if (btn) {
      btn.className = dom.setClass({ hide : true });
    }

    // ### Submit Request
    api.delete(`/licenses/${ licenseId }`, function (err) {
      if (err) {
        if (btn) {
          btn.className = dom.setClass({
            hide : false
          });
        }
        return this.error(err.message);
      }

      // ### Update State
      this.setState('licenses', function () {
        let models  = this.getState('licenses');
        let result = [];
        models.forEach((model) => {
          if (model.id !== licenseId) {
            result.push(model);
          }
        });
        return result;
      }.call(this));

      // ### Notify
      // Notify client of successfull removal.

      this.success(`Your license was successfully removed from your account`);
    }.bind(this));

  }

}
