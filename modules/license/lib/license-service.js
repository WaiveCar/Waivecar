'use strict';

let queryParser = Bento.provider('sequelize/helpers').query;
let License     = Bento.model('License');
let error       = Bento.Error;
let relay       = Bento.Relay;
let Service     = require('./classes/service');
let Checkr      = require('./checkr');
let resource    = 'licenses';

module.exports = class LicenseService extends Service {

  /**
   * Registers a new license with the requested user.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *store(data, _user) {
    let user = yield this.getUser(data.userId);

    // ### Ensure Access
    // Make sure the user making the request is authorized to create a new license.
    this.hasAccess(user, _user);

    // ### Create License.
    let license = new License(data);
    yield license.save();

    [ 'firstName', 'lastName', 'email', 'phone' ].forEach((val) => {
      let currentValue = user.hasOwnProperty(val) ? user[val] : undefined;
      if (!currentValue) {
        throw error.parse({
          code    : `MISSING_PARAMETER`,
          message : `User object is missing [${ val }] parameter`
        }, 400);
      }
    });

    [ 'zip', 'birthDate', 'number', 'state', 'ssn' ].forEach((val) => {
      let currentValue = license.hasOwnProperty(val) ? license[val] : undefined;
      if (!currentValue) {
        throw error.parse({
          code    : `MISSING_PARAMETER`,
          message : `License object is missing [${ val }] parameter`
        }, 400);
      }
    });

    // ### Create Checkr Candidate
    let candidate = {
      'first_name'            : user.firstName,
      'middle_name'           : user.middleName,
      'last_name'             : user.lastName,
      email                   : user.email,
      phone                   : user.phone,
      zipcode                 : license.zip,
      dob                     : license.birthDate,
      'driver_license_number' : license.number,
      'driver_license_state'  : license.state,
      'format'                : 'ST',
      'custom_id'             : license.id,
      ssn                     : license.ssn
    }

    let createdCandidate = yield Checkr.createCandidate(candidate, _user);

    // ### Update License to store Checkr Candidate Id.
    yield license.update({
      status      : 'provided',
      candidateId : createdCandidate.id
    });

    // ### Relay
    relay.admin(resource, {
      type : 'store',
      data : license
    });

    return license;
  }

  /**
   * Returns license index.
   * @param  {Object} role
   * @param  {Object} _user
   * @return {Object}
   */
  static *index(query, role, _user) {
    if (role.isAdmin()) {
      return yield License.find(queryParser(query, {
        where : {
          userId       : queryParser.NUMBER,
          number       : queryParser.STRING,
          firstName    : queryParser.STRING,
          middleName   : queryParser.STRING,
          lastName     : queryParser.STRING,
          birthDate    : queryParser.DATE,
          country      : queryParser.STRING,
          state        : queryParser.STRING,
          collectionId : queryParser.STRING
        }
      }));
    }
    return yield License.find({
      where : {
        userId : _user.id
      }
    });
  }

  /**
   * Retrieves a license based on provided id.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    this.hasAccess(user, _user);

    return license;
  }

  /**
   * Updates a license.
   * @param  {Number} id
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *update(id, data, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    this.hasAccess(user, _user);

    data.status = 'provided';

    // ### Update License
    yield license.update(data);

    // ### Relay
    relay.admin(resource, {
      type : 'update',
      data : license
    });

    return license;
  }

  /**
   * Deletes a license.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *delete(id, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    // ### Delete License
    yield license.delete();

    // ### Relay
    relay.admin(resource, {
      type : 'delete',
      data : license
    });

    return license;
  }

};
