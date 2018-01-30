'use strict';
let queryParser  = Bento.provider('sequelize/helpers').query;
let License      = Bento.model('License');
let error        = Bento.Error;
let relay        = Bento.Relay;
let Service      = require('./classes/service');
let Verification = require('./onfido');
let resource     = 'licenses';
let moment       = require('moment');
let notify       = Bento.module('waivecar/lib/notification-service');
let redis        = require('../../waivecar/lib//redis-service');

module.exports = class LicenseService extends Service {

  /**
   * Registers a new license with the requested user.
   * @param  {Object} data
   * @param  {Object} _user
   * @return {Object}
   */
  static *store(data, _user) {
    let user = yield this.getUser(data.userId);


    if (!redis.shouldProcess('new-license', data.userId)) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `User already has a registered license`
      }, 400);
    }

    // Check if user already has license
    if (yield License.findOne({ where : { userId : data.userId } })) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `User already has a registered license`
      }, 400);
    }

    // API: Licenses must be unique #456
    //
    // Make sure the user hasn't registered before.  It appears
    // that state/license pairs are globally unique identifiers
    // and that the license number alone is insufficient.
    //
    // First we normalize the data
    data.number = data.number.toUpperCase();
    // Check if user already has license
    if (yield License.findOne({ where : { 
      state : data.state,
      number: data.number
    } })) {
      throw error.parse({
        code    : `DUPLICATE_LICENSE`,
        message : `This license has already been registered. Please use the contact form for questions if you believe this is an error.`
      }, 400);
    }

    this.hasAccess(user, _user);

    // Strip time off birthDate
    if (data.birthDate && /.+T.+/.test(data.birthDate)) {
      data.birthDate = data.birthDate.split('T')[0];
    }

    // Check that birthdate is > 21 years
    var age = moment().diff(data.birthDate, 'years');
    if (age < 21) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `You must be 21 years old to access this service`
      }, 400);
    } else if (age > 200) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `Your date of birth appears to have some errors. Are you really ${age} years old?`
      }, 400);
    }

    let license = new License(data);

    if (license.birthDate) {
      let userLink         = yield Verification.createUserLink(user, license, _user);
      license.linkedUserId = userLink.id;
      license.status       = 'provided';
    }

    yield license.save();

    license.relay('store');

    return license;
  }

  /**
   * Returns license index.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Object}
   */
  static *index(query, _user) {
    if (query.search) {
      query = {
        where : {
          $or : [
            { firstName : { $like : `${ query.search }%` } },
            { lastName : { $like : `${ query.search }%` } },
            { status : { $like : `${ query.search }%` } },
            { outcome : { $like : `${ query.search }%` } }
          ]
        }
      };
    } else {
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
    }

    if (_user.hasAccess('admin')) {
      return yield License.find(query);
    }

    query.where.userId = _user.id;
    query.order = [ ['id', 'DESC'] ];
    var license = yield License.findOne(query);
    return license ? [license] : [];
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
      let userLink      = yield Verification.createUserLink(user, data, _user);
      data.linkedUserId = userLink.id;
      data.status       = 'provided';
    }

    // ### Update License

    // So when a license moves to consider we need to send an SMS to the user.
    // This is where it happens to happen.
    //
    if(license.outcome !== data.outcome && data.outcome === 'clear') {
      yield notify.sendTextMessage(user, `Congrats! You have been approved to drive with WaiveCar!`);
    }

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
