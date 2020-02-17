'use strict';
let queryParser  = Bento.provider('sequelize/helpers').query;
let License      = Bento.model('License');
let error        = Bento.Error;
let relay        = Bento.Relay;
let Service      = require('./classes/service');
let Verification = require('./checkr');
let resource     = 'licenses';
let moment       = require('moment');
let notify       = Bento.module('waivecar/lib/notification-service');

module.exports = class LicenseService extends Service {
  static *store(data, _user) {
    let user = yield this.getUser(data.userId);

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
    // For now we are just going to allow creation of duplicate license objects because this is causing
    // bugs elsewhere. We will put it back in later if this ends up being a problem
    /*
    if (yield License.findOne({ where : { 
      state : data.state,
      number: data.number
    } })) {
      throw error.parse({
        code    : `DUPLICATE_LICENSE`,
        message : `This license has already been registered. Please use the contact form for questions if you believe this is an error.`
      }, 400);
    }
    */
    if (!data.fromComputer) {
      this.hasAccess(user, _user);
    }

    // Strip time off birthDate
    if (data.birthDate && /.+T.+/.test(data.birthDate)) {
      data.birthDate = data.birthDate.split('T')[0];
    }

    // Strip time off expirationDate
    if (data.expirationDate && /.+T.+/.test(data.expirationDate)) {
      data.expirationDate = data.expirationDate.split('T')[0];
    }

    // Check that birthdate is over the minimum
    var minimumAge = (yield user.hasTag('csula')) ? 18 : 21;

    var age = moment().diff(data.birthDate, 'years');
    if (age < minimumAge) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `You must be ${minimumAge} years old to access this service`
      }, 400);
    } else if (age > 200) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `Your date of birth appears to have some errors. Are you really ${age} years old?`
      }, 400);
    }
    let license = new License(data);

    if (license.birthDate) {
      try {
        let userLink         = yield Verification.createUserLink(user, license, _user);
        license.linkedUserId = userLink.id;
        license.status       = 'provided';
      } catch(e) {
        yield notify.slack(
          {text: `:exploding_head: ${user.link()} Failed to add user to Checkr. ${JSON.stringify(e)}`},
          {channel: '#user-alerts'},
        );
        license.status = 'Checkr Error';
      };
    }

    yield license.save();

    license.relay('store');
    return license;
  }

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

    return [yield _user.getLicense()];
  }

  static *show(id, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    this.hasAccess(user, _user);

    return license;
  }

  // normally (see below) we need to know the database license id to
  // run the update, which is fucking stupid. We know the
  // user and that's enough.
  static *unspecificUpdate(data, _user) {
    let license = yield _user.getLicense();
    let validData = {};
    let whiteList = ['expirationDate','birthDate','lastName','firstName','zip','state','city','street1','street2','number'];

    Object.keys(data).forEach(key => {
      if (whiteList.includes(key)) {
        validData[key] = data[key];
      }
    });

    yield license.update(validData);

    relay.admin(resource, {
      type : 'update',
      data : license
    });

    return license;
  }

  static *update(id, data, _user) {

    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    this.hasAccess(user, _user);

    yield license.update(data);
    
    // ### create user in verification provider and establish link.

    //
    // The old style onfido ids were pure base16 uuidv5s with hyphens.
    // The checkr ones appear to be base64 strings. So we can check for
    // a hyphen to see if its onfido. If so we re-run it.
    //
    if (!data.skipCheckr) {
      if (!license.linkedUserId || (license.linkedUserId && license.linkedUserId.match(/-/)) || (license.checkId && license.checkId.match(/-/))) {
        let userLink      = yield Verification.createUserLink(user, Object.assign({}, data, license), _user);
        data.linkedUserId = userLink.id;
        data.status       = 'provided';
      }
    }

    // ### Update License

    // So when a license moves to consider we need to send an SMS to the user.
    // This is where it happens to happen.
    if(license.outcome !== data.outcome && data.outcome === 'clear') {
      data.status = data.status || 'complete';
      yield notify.sendTextMessage(user, `Congrats! You have been approved to use Waive!`);
    }

    yield license.update(data);

    relay.admin(resource, {
      type : 'update',
      data : license
    });

    return license;
  }

  static *delete(id, _user) {
    let license = yield this.getLicense(id);
    let user    = yield this.getUser(license.userId);

    yield license.delete();

    relay.admin(resource, {
      type : 'delete',
      data : license
    });

    return license;
  }

};
