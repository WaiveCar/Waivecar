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
   * Creates a Onfido Candidate.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}        candidate
   */
  static *createUserLink(data, _user) {
    let response = yield this.request('/applicants', 'POST', data);
    return response;
  }

  /**
   * Creates a Onfido Check
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}       applicant
   */
  static *createCheck(applicantId, data, _user) {
    let response = yield this.request(`/applicants/${ applicantId }/checks`, 'POST', data);
    return response;
  }

  /**
   * Retrieves a Onfido Check
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}        candidate
   */
  static *getCheck(data, _user) {
    let response = yield this.request(`/applicants/${ data.applicantId }/checks`);
    return response;
  }

  // *
  //  * Retrieves a Completed Onfido Report.
  //  * @param  {Object} data
  //  * @param  {Object} _user
  //  * @return {Object}        candidate

  // static *getReport(id, _user) {
  //   let response = yield this.request(`/motor_vehicle_reports/${ id }`);
  //   return response;
  // }

  /**
   * Returns the Response from a Request aginst the Onfido API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  static *request(resource, method, data) {
    let options = {
      url : config.onfido.uri + resource,
      method : method || 'GET',
      headers : {
        Accept          : 'application/json',
        'Content-Type'  : 'application/json',
        'Authorization' : `Token token=${ config.onfido.key }`
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

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

}
