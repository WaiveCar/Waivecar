import { api, auth, dom, helpers } from 'bento';
import Service                     from './component-service';
import async                       from 'async';

module.exports = class License extends Service {

  /**
   * Stores the provided context.
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
  submitLicense(data, userId) {
    this.addLicense(userId, data, (err, license) => {
      if (err) {
        console.log('err submitting: ', err)
        return this.error(err.data ? err.data : err.message);
      }

      this.setState('licenses', [
        ...this.getState('licenses'),
        license
      ]);
      this.success(`Your license was stored successfully. Request for it to be verified prior to booking a WaiveCar.`);
    });
  }

  validateLicense() {
    api.post(`/licenses/${ this.getState('licenses')[0].id }/verify`, { userId : auth.user().id }, (err, license) => {
      if (err) {
        if (err.data) {
          return this.error(err.data);
        }
        return this.error(err.message);
      }

      this.setState('licenses', [
        ...this.getState('licenses'),
        license
      ]);

      if (license.status === 'complete') {
        this.success(`Your request for verification has been completed.`);
      } else {
        this.success(`Your request for verification has been submitted successfully. Please check back later.`);
      }
    });
  }

  /**
   * Adds a new license under the provided user.
   */
  addLicense(userId, license, done) {
    async.each([ 'state', 'number', 'birthDate', 'expirationDate', 'lastName', 'firstName' ], function(field, next) {
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
        userId     : userId,
        firstName  : license.firstName,
        middleName : license.middleName,
        lastName   : license.lastName,
        birthDate  : license.birthDate,
        expirationDate: license.expirationDate,
        state      : license.state,
        number     : license.number
      }, (err, license) => {
        if (err) {
          return done(err);
        }
        return done(null, license);
      });
    });
  }

  /**
   * Loads licenses from the api and adds them to the array on the ctx.
   */
  setLicenses(userId) {
    api.get('/licenses', {
      userId : userId
    }, (err, data) => {
      if (err) {
        console.log('err: ', err);
        return this.error(err.message);
      }
      this.setState('licenses', data);
    });
  }

  /**
   * Deletes a license and updates the array on the ctx.
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
    api.delete(`/licenses/${ licenseId }`, (err) => {
      if (err) {
        if (btn) {
          btn.className = dom.setClass({
            hide : false
          });
        }
        return this.error(err.message);
      }

      // ### Update State
      this.setState('licenses', function() {
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
    });

  }

}
