'use strict';

let request       = require('co-request');
let moment        = require('moment');
let queue         = Bento.provider('queue');
let queryParser   = Bento.provider('sequelize/helpers').query;
let User          = Bento.model('User');
let License       = Bento.model('License');
let error         = Bento.Error;
let relay         = Bento.Relay;
let config        = Bento.config.license;
let log           = Bento.Log;
let Service       = require('../classes/service');
let notify        = Bento.module('waivecar/lib/notification-service');

if (!config.onfido) {
  throw error.parse({
    code     : 'LICENSE_ONFIDO_CONFIG',
    message  : 'Missing configuration for license service [Onfido]',
    solution : 'Make sure to set up the correct configuration for your Onfido account'
  });
}

module.exports = class OnfidoService {

  /**
   * Create Applicant
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *createUserLink(user, license, _user) {

    [ 'email', 'phone' ].forEach((val) => {
      let currentValue = user[val];
      if (!currentValue) {
        throw error.parse({
          code    : `MISSING_PARAMETER`,
          message : `User object is missing [${ val }] parameter`
        }, 400);
      }
    });

    [ 'firstName', 'lastName', 'birthDate', 'number', 'state' ].forEach((val) => {
      let currentValue = license[val];
      if (!currentValue) {
        throw error.parse({
          code    : `MISSING_PARAMETER`,
          message : `License object is missing [${ val }] parameter`
        }, 400);
      }
    });

    // ### Create Verification Candidate
    /*eslint-disable */
    let candidate = {
      email       : user.email,
      mobile      : user.phone,
      first_name  : license.firstName,
      last_name   : license.lastName,
      dob         : license.birthDate,
      country     : 'USA',
      id_numbers  : [
        {
          type       : 'driving_license',
          value      : license.number,
          state_code : license.state
        }
      ]
    };

    // optional inclusions:
    if (license.middleName) candidate['middle_name'] = license.middleName;
    if (license.gender) candidate.gender = license.gender;
    /*eslint-enable */

    let response = yield this.request('/applicants', 'POST', candidate, user);
    return response;
  }

  /**
   * Retrieves all Applicants
   * @param  {Object} _user
   * @return {Object}
   */
  static *getUserLinks(_user) {
    let response = yield this.request(`/applicants`);
    return response;
  }

  /**
   * Retrieves an Applicant
   * @param  {Object} applicantId
   * @param  {Object} _user
   * @return {Object}
   */
  static *getUserLink(applicantId, _user) {
    let response = yield this.request(`/applicants/${ applicantId }`);
    return response;
  }

  /**
   * Creates a Check
   * @param  {Object} applicantId
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *createCheck(applicantId, data, _user) {
    let response = yield this.request(`/applicants/${ applicantId }/checks`, 'POST', data);
    return response;
  }

  /**
   * Retrieves Applicant's Checks
   * @param  {Object} applicantId
   * @param  {Object} _user
   * @return {Object}
   */
  static *getChecks(applicantId, _user) {
    let response = yield this.request(`/applicants/${ applicantId }/checks`);
    return response;
  }

  /**
   * Retrieves an Applicant's Check
   * @param  {Object} applicantId
   * @param  {Object} checkId
   * @param  {Object} _user
   * @return {Object}
   */
  static *getCheck(applicantId, checkId, _user) {
    let response = yield this.request(`/applicants/${ applicantId }/checks/${ checkId }`);
    return response;
  }

  /**
   * Retrieves Check's Reports
   * @param  {Object} applicantId
   * @param  {Object} _user
   * @return {Object}
   */
  static *getReport(applicantId, checkId, _user) {
    let response = yield this.request(`/checks/${ checkId }/reports`);
    return response;
  }

  /**
   * Retrieves a Check's Report
   * @param  {Object} applicantId
   * @param  {Object} checkId
   * @param  {Object} reportId
   * @param  {Object} _user
   * @return {Object}
   */
  static *getReport(applicantId, checkId, reportId, _user) {
    let response = yield this.request(`/checks/${ checkId }/reports/${ reportId }`);
    return response;
  }

  /**
   * Returns the Response from a Request aginst the Onfido API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  static *request(resource, method, data, user) {
    let options = {
      url     : config.onfido.uri + resource,
      method  : method || 'GET',
      headers : {
        Accept         : 'application/json',
        'Content-Type' : 'application/json',
        Authorization  : `Token token=${ config.onfido.key }`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let result   = yield request(options);
    let response = result.toJSON();

    if (!response || response.statusCode > 201) {
      throw error.parse(yield this.getError(resource, result, user), response.statusCode || 400);
    }

    return JSON.parse(response.body);
  }

  static *getError(resource, result, user) {
    let data = result.body ? JSON.parse(result.body) : null;
    if (!data) {
      return {
        code    : `LICENSE_SERVICE_${ resource }`,
        message : `LICENSE: ${ resource }`
      };
    }

    let errors = '';
    let errorMap = [];
    if (data.error && data.error.type === 'validation_error') {
      console.log(data.error);
      for (let field in data.error.fields) {
        let messages = data.error.fields[field];
        let messageArray = messages.map((f) => {
          if (f.value) {
            return f.value.join(' ');
          } else {
            return f;
          }
        });
        errors += `${ messageArray.join(' ') }`;
        errorMap[field] = errors;
        errorMap.push(field);
        errorMap.push(errors);
      }

      if (errors === 'You have already entered this applicant into your Onfido system') {
        data.error.message = 'Your Email Address has already been used to request validation of a License. Please contact us.';
      }

      if (errors === `Sorry, you don't have enough credit to make this purchase`) {
        log.error('License - Onfido : ' + errors);
      }

      if (data.error.fields.email) {
        data.error.message = 'Invalid email address';
      }

      if (data.error.fields.id_numbers) {
        data.error.message = 'Invalid license number';
      }

      yield notify.notifyAdmins(`Call to onfido failed : ${ user ? user.name() + ' - ' + (user.phone || user.email) : ''} : ${ errorMap.join(' - ') }`, [ 'slack' ], { channel : 'api-errors' });

      return {
        code    : 'LICENSE_SERVICE_VALIDATION_ERROR',
        message : data.error.message,
        data    : null
      };
    }

    return {
      code    : `LICENSE_SERVICE_${ resource }`,
      message : `LICENSE: ${ resource }`,
      data    : result.body ? JSON.parse(result.body) : null
    };
  }

};
