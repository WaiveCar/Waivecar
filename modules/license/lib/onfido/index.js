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
  static *createUserLink(data, _user) {
    data.email = `test-${ Math.ceil(Math.random() * 100) }@example.com`;
    let response = yield this.request('/applicants', 'POST', data);
    console.log(response);
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
  static *request(resource, method, data) {
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
      throw error.parse({
        code    : `LICENSE_SERVICE`,
        message : `LICENSE: ${ resource }`,
        data    : result.body ? JSON.parse(result.body) : null
      }, response.statusCode || 400);
    }

    return JSON.parse(response.body);
  }

};
