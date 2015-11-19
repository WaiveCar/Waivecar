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

if (!config.checkr) {
  throw error.parse({
    code     : 'LICENSE_CHECKR_CONFIG',
    message  : 'Missing configuration for license service [Checkr]',
    solution : 'Make sure to set up the correct configuration for your Checkr account'
  });
}

module.exports = class CheckrService {

  /**
   * Creates a Checkr Candidate.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}        candidate
   */
  static *createCandidate(data, _user) {
    let response = yield this.request('/candidates', 'POST', data);
    return response;
  }

  /**
   * Creates a Checkr Report.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}        candidate
   */
  static *createReport(data, _user) {
    let response = yield this.request('/reports', 'POST', data);
    return response;
  }

  /**
   * Retrieves a Completed Checkr Report.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}        candidate
   */
  static *getReport(id, _user) {
    let response = yield this.request(`/motor_vehicle_reports/${ id }`);
    return response;
  }

  /**
   * Returns the Response from a Request aginst the Checkr API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  static *request(resource, method, data) {
    let headers = config.checkr.headers;
    let options = {
      url    : config.checkr.uri + resource,
      method : method || 'GET',
      auth   : {
        user     : config.checkr.key,
        password : ''
      },
      headers : {
        Accept         : 'application/json',
        'Content-Type' : 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(options);

    let result   = yield request(options);
    let response = result.toJSON();
    console.log(response);
    if (!response || response.statusCode > 201) {
      throw error.parse({
        code    : `LICENSE_SERVICE`,
        message : `LICENSE: ${ resource }`,
        data    : result.body ? JSON.parse(result.body) : null
      }, response.statusCode || 400);
    }

    return JSON.parse(response.body);
  }

};
