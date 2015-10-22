'use strict';

let Service     = require('./classes/service');
let queryParser = Reach.provider('sequelize/helpers').query;
let License     = Reach.model('License');
let error       = Reach.Error;
let relay       = Reach.Relay;
let resource    = 'licenses';

class LicenseService extends Service {

  /**
   * Registers a new license with the requested user.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  *store(data, _user) {
    let user = yield this.getUser(data.userId);

    // ### Ensure Access
    // Make sure the user making the request is authorized to create a new license.

    this.hasAccess(user, _user);

    // ### Create License

    let license = new License(data);

    // -----------------------------------
    // TODO: VERIFY THE LICENSE PARAMETERS
    // -----------------------------------

    yield license.save();

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
  *index(query, role, _user) {
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
  *show(id, _user) {
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
  *update(id, data, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    this.hasAccess(user, _user);

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
  *delete(id, _user) {
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

}

module.exports = new LicenseService();