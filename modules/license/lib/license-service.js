'use strict';

let queryParser  = Bento.provider('sequelize/helpers').query;
let License      = Bento.model('License');
let error        = Bento.Error;
let relay        = Bento.Relay;
let Service      = require('./classes/service');
let Verification = require('./onfido');
let resource     = 'licenses';

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

    // ### create user in verification provider and establish link.
    if (license.birthDate) {
      let user = yield this.getUser(license.userId);
      let userLink = yield Verification.createUserLink(user, license, _user);
      license.linkedUserId = userLink.id;
      license.status = 'provided';
    }

    yield license.save();

    relay.admin(resource, {
      type : 'store',
      data : license
    });

    return license;
  }

  /**
   * Returns license index.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Object}
   */
  static *index(query, _user) {
    query = queryParser(query, {
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
    });

    if (_user.hasAccess('admin')) {
      return yield License.find(query);
    }

    query.where.userId = _user.id;
    return yield License.find(query);
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

    // ### create user in verification provider and establish link.
    if (!license.linkedUserId) {
      let userLink = yield Verification.createUserLink(user, data, _user);
      data.linkedUserId = userLink.id;
      data.status = 'provided';
    }

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
