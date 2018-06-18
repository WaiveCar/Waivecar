'use strict';

let Facebook   = require('./social/facebook');
let User       = Bento.model('User');
let GroupUser  = Bento.model('GroupUser');
let Waitlist   = Bento.model('Waitlist');
let changeCase = Bento.Helpers.Case;
let hooks      = Bento.Hooks;
let error      = Bento.Error;
let relay      = Bento.Relay;
let config     = Bento.config;
let waitlist   = require('../../waivecar/lib/waitlist-service.js');

module.exports = class FacebookService {

  /**
   * Handles a incoming facebook service request.
   * @param  {Object} data
   * @param  {Object} _user The authenticated user making the request.
   * @return {Object}
   */
  static *handle(data, _user) {

    // ### Connect
    // Facebook connect requests requires that the request is coming from an authenticated user

    if (data.type === 'connect') {
      if (!_user) {
        throw error.parse({
          code     : `FB_CONNECT_FAILED`,
          message  : `You must be logged in to connect a facebook account.`,
          solution : `Provide the Authorization token in the request header.`
        }, 400);
      }
    }

    // ### Facebook Profile
    // Attempt to retrieve the facebook profile based on the provided data.

    let fb = yield this.getProfile(data);

    // ### Request Type
    // Handle the request based on the request type provided.

    switch (data.type) {
      case 'login'    : return yield this.login(fb);
      case 'connect'  : return yield this.connect(fb, _user);
      case 'register' : return yield this.register(fb);
      case 'waitlist' : return yield this.waitlist(fb);
      default : {
        throw error.parse({
          code    : `FB_INVALID_REQUEST`,
          message : `We do not support facebook request type '${ data.type }'.`
        }, 400);
      }
    }
  }

  /**
   * Attempts to login the user based on the facebook profile provided.
   * @param  {Object} fb
   * @return {Object}
   */
  static *login(fb) {
    let user = yield User.findOne({
      where : {
        facebook : fb.id
      }
    });
    if (!user) {
      throw error.parse({
        code     : `FB_LOGIN_FAILED`,
        message  : `The provided facebook account has not been connected with any account in our system.`,
        solution : `Connect the account with facebook before attempting to sign in with FB credentials.`,
        data     : {
          email : fb.email
        }
      }, 400);
    }
    

    return user;
  }

  static *connect(fb, user) {
    yield user.update({
      facebook : fb.id
    });
  }

  static *register(fb) {
    fb.facebook = fb.id;
    let userEntry = yield User.findOne({
      where : {
        $or : [
          { email : fb.email },
          { facebook : fb.id }
        ]
      }
    });
    let waitlistEntry = yield Waitlist.findOne({
      where : {
        $or : [
          { email: fb.email },
          { facebook : fb.id },
        ]
      }
    }); 
    // If a user has already signed up using an email and password, they are unable to sign in with facebook 
    if ((userEntry && userEntry.facebook !== fb.id) || waitlistEntry && waitlistEntry.facebook !== fb.id) {
      throw error.parse({
        code    : 'SIGNED_UP_WITH_PASSWORD',
        message : 'The e-mail associated with this facebook account is already used by a previously created account.'
      }, 400);
    }

    let data = changeCase.objectKeys('toCamel', fb);
    if (hooks.has('user:store:before')) {
      data = yield hooks.call('user:store:before', data);
    }

    // If their is no waitlist entry and no user entry, it must be the user's first time signing up
    if (!waitlistEntry && !userEntry) {
      data.facebook = data.id;
      let item = yield waitlist.add(data);
      item.record.isNew = true;
      return item.record;
    }
    // If they are waitlisted, but not active users, this error is thrown
    if (waitlistEntry && !userEntry) {
      throw error.parse({
        code    : `AUTH_INVALID_GROUP`,
        message : `You're currently on the waitlist. We'll contact you when you're account is active.`
      }, 400);
    }
    return userEntry;
  }

  static *getProfile(data) {
    let facebook = new Facebook();
    let profile  = yield facebook.getProfile(data.token, data.fields);
    if (!profile) {
      throw error.parse({
        code    : `FB_PROFILE_ERROR`,
        message : `Could not retrieve facebook profile with the provided token.`,
        data    : {
          token : data.token
        }
      }, 400);
    }
    return profile;
  }

};
