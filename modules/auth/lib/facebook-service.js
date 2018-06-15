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
/*
  static *checkIfExists(fb) {
    fb.facebook = fb.id;
    //delete fb.id; // Remove facebook id value so not to over-write our system value.
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
    // Need to add checks for if email and phone number are already in db and need to add appropriate error messages
    // Also need to figure out why you cannot sign up for facebook from the login page

    if (!waitlistEntry && !userEntry) {
      let data = changeCase.objectKeys('toCamel', fb);
      if (hooks.has('user:store:before')) {
        data = yield hooks.call('user:store:before', data);
      }
      data.facebook = data.id;
      yield waitlist.add(data);
      data.newUser = true;
      return data;
    }

    if (waitlistEntry && !userEntry) {
      throw error.parse({
        code    : `AUTH_INVALID_GROUP`,
        message : `You're currently on the waitlist. We'll contact you when you're account is active.`
      }, 400);
    }
  }
*/
  static *register(fb) {
    // This just throws errors if there are problems, may need to also check the waitlist table
    // May be able to remove this function altogether
    //let res = yield this.checkIfExists(fb);
    fb.facebook = fb.id;
    //delete fb.id; // Remove facebook id value so not to over-write our system value.
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
    // Need to add checks for if email and phone number are already in db and need to add appropriate error messages

    if (!waitlistEntry && !userEntry) {
      let data = changeCase.objectKeys('toCamel', fb);
      if (hooks.has('user:store:before')) {
        data = yield hooks.call('user:store:before', data);
      }
      data.facebook = data.id;
      let item = yield waitlist.add(data);
      return item.record;
    }

    if (waitlistEntry && !userEntry) {
      throw error.parse({
        code    : `AUTH_INVALID_GROUP`,
        message : `You're currently on the waitlist. We'll contact you when you're account is active.`
      }, 400);
    }
    // Also need to check database for email and phone number
    relay.emit('user', {
      type : 'store',
      data : userEntry.toJSON(),
    });
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
