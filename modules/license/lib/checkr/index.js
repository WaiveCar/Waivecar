'use strict';

let coRequest = require('co-request');
let request = require('request');
let moment = require('moment');
let queue = Bento.provider('queue');
let queryParser = Bento.provider('sequelize/helpers').query;
let User = Bento.model('User');
let License = Bento.model('License');
let File = Bento.model('File');
let S3 = require('../../../file/lib/classes/s3.js');
let error = Bento.Error;
let relay = Bento.Relay;
let config = Bento.config.license;
let log = Bento.Log;
let Service = require('../classes/service');
let notify = Bento.module('waivecar/lib/notification-service');
let fs = require('fs');
let path = require('path');
let http = require('http');
let os = require('os');

if (!config.checkr) {
  throw error.parse({
    code: 'LICENSE_CHECKR_CONFIG',
    message: 'Missing configuration for license service [Checkr]',
    solution:
      'Make sure to set up the correct configuration for your Checkr account',
  });
}

module.exports = class CheckrService {
  // This function puts the users into the checkr system and adds the checkr id to the database
  static *createUserLink(user, license, _user) {
    ['email', 'phone'].forEach(val => {
      let currentValue = user[val];
      if (!currentValue) {
        throw error.parse(
          {
            code: `MISSING_PARAMETER`,
            message: `User object is missing [${val}] parameter`,
          },
          400,
        );
      }
    });

   ['firstName', 'lastName', 'birthDate', 'number', 'state'].forEach(val => {
      let currentValue = license[val];
      if (!currentValue) {
        throw error.parse(
          {
            code: `MISSING_PARAMETER`,
            message: `License object is missing [${val}] parameter`,
          },
          400,
        );
      }
    });

    let candidate = {
      email: user.email,
      phone: user.phone,
      first_name: license.firstName,
      last_name: license.lastName,
      dob: license.birthDate,
      country: 'USA',
      driver_license_number: license.number,
      driver_license_state: license.state,
      street: [license.street1, license.street2].join(' '),
      city: license.city,
      zip: license.zip
    };
    // optional inclusions the 'no_middle_name' option is required for checkr if there is no middle name
    if (license.middleName) {
      candidate['middle_name'] = license.middleName;
    } else {
      candidate['no_middle_name'] = true;
    }

    let response = yield this.request('/candidates', 'POST', candidate, user);
    return response;
  }
  // This creates a request to checkr to make checkr fetch the report
  static *createCheck(data, _user, license) {
    yield this.uploadImage(data, license);
    try {
      let response = yield this.request('/reports', 'POST', data);
      return response;
    } catch(err) {
      /*
      yield notify.slack(
        {text: `:lightning: ${_user.link()} license failed to be processed by checkr.`},
        {channel: '#user-alerts'}
      );
      notify.sendTextMessage(_user, 'WaiveCar is unable to check your license. Extra paperwork is sometimes needed. Call us at this number between 9AM-9PM for assistance.');
      throw error.parse(
        {
          code: 'ERROR_FETCHING_REPORT',
          message: 'There was error with your report request to checkr.',
        },
        400,
      ); 
      */
      return true;
    }
  }

  static *uploadImage(data, license) {
    let licenseImageFile = yield File.findOne({where: {id: license.fileId}});
    if (licenseImageFile) {
      let file = fs.createWriteStream(path.join(os.tmpdir(), `${license.linkedUserId}-license.jpg`));
      let image = request(`http://s3.amazonaws.com/waivecar-prod/${licenseImageFile.path}`);
      image.pipe(file).on('finish', () => {
        request.post({
          url: `${config.checkr.uri}/candidates/${data.candidate_id}/documents`, 
          method: 'post',
          headers: {
            accept: 'application/json',
            'Content-Type': 'form-data'
          },
          formData: {
            file: fs.createReadStream(path.join(os.tmpdir(), `${license.linkedUserId}-license.jpg`)),
            type: 'driver_license',
          }
        }, (err, response, body) => {
          if (err) {
            fs.appendFile( '/var/log/outgoing/checkr.txt', JSON.stringify([err, body, response]) + '\n', function(){});
            return err;
          }
          fs.appendFile( '/var/log/outgoing/checkr.txt', JSON.stringify([body, response]) + '\n', function(){});
        });
      });
    }
  }

  // This fetches the report for an indiviudal report id
  static *getReport(reportId) {
    try {
      let response = yield this.request(`/motor_vehicle_reports/${reportId}`);
      return response;
    } catch(err) {
      log.info(`Failed to fetch report ${reportId}`);  
    }
  }

  // Returns the Response from a Request aginst the Checkr API
  static *request(resource, method, data, user) {
    let options = {
      url: config.checkr.uri + resource,
      method: method || 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let result = yield coRequest(options);
    let response = result.toJSON();
    let body = false;

    if (response && response.body) {
      body = JSON.parse(response.body);
    }
    fs.appendFile(
      '/var/log/outgoing/checkr.txt',
      JSON.stringify([options, body, response]) + '\n',
    );
    if (!response || response.statusCode > 201) {
      throw error.parse(
        {
          code: 'ERROR_MAKING_REQUEST',
          message: 'There was an error in your request to checkr.',
        },
        400,
      );
    }
    return body;
  }
};
