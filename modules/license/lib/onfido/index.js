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
let fs            = require('fs');

if (!config.checkr) {
  throw error.parse({
    code     : 'LICENSE_CHECKR_CONFIG',
    message  : 'Missing configuration for license service [Checkr]',
    solution : 'Make sure to set up the correct configuration for your Checkr account'
  });
}

module.exports = class OnfidoService {

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
    let candidate = {
      email       : user.email,
      phone      : user.phone,
      first_name  : license.firstName,
      last_name   : license.lastName,
      dob         : license.birthDate,
      country     : 'USA',
      driver_license_number : license.number,
      driver_license_state : license.state,
    };

    // optional inclusions:
    if (license.middleName) {
      candidate['middle_name'] = license.middleName;
    } else {
      candidate['no_middle_name'] = true;
    }

    let response = yield this.request('/candidates', 'POST', candidate, user);
    return response;
  }

  static *createCheck(data, _user) {
    console.log('data: ', data);
    let response = yield this.request('/reports', 'POST', data);
    return response;
  }
  
  // This is used and needs to be repaired
  static *getChecks(applicantId, _user) {
    let response = yield this.request(`/applicants/${ applicantId }/checks`);
    return response;
  }

  static *getReport(reportId) {
    let response = yield this.request(`/reports/${ reportId }`);
    return response;
  }

  /**
   * Returns the Response from a Request aginst the Onfido API
   */
  static *request(resource, method, data, user) {
    let options = {
      url     : config.checkr.uri + resource,
      method  : method || 'GET',
      headers : {
        Accept         : 'application/json',
        'Content-Type' : 'application/json',
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let result   = yield request(options);
    let response = result.toJSON();
    let body = false;

    if (response && response.body) {
      body = JSON.parse(response.body);
    }
    fs.appendFileSync('/var/log/outgoing/onfido.txt', JSON.stringify([options, body, response]) + "\n");
    console.log('body: ', body);
    if (!response || response.statusCode > 201) {
      throw error.parse(yield this.getError(resource, result, user), response.statusCode || 400);
    }

    return body;
  }

  static *getError(resource, result, user) {
    let data;
    try {
      data = result.body ? JSON.parse(result.body) : null;
    } catch (err) {}
    if (!data) {
      return {
        code    : `LICENSE_SERVICE_${ resource }`,
        message : `LICENSE: ${ resource }`
      };
    }

    let errors = '';
    let errorMap = [];
    if (data.error && data.error.type === 'validation_error') {
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

      yield notify.notifyAdmins(`Call to onfido failed : ${ user ? user.name() + ' - ' + (user.phone || user.email) : ''} : ${ errorMap.join(' - ') }`, [ 'slack' ], { channel : '#api-errors' });

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
