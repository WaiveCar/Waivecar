'use strict';

let Facebook   = require('./social/facebook');
let User       = Bento.model('User');
let GroupUser  = Bento.model('GroupUser');
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

  static *checkIfExists(fb) {
    let res = yield User.findOne({
      where : {
        $or : [
          { email : fb.email },
          { facebook : fb.id }
        ]
      }
    });

    // ### Conflicts
    // Check for conflicts, if the facebook id or email already exists in the system.

    if (res && res.facebook) {
      throw error.parse({
        code     : `FB_ID_EXISTS`,
        message  : `The facebook account is already connected to an account in our system.`,
        solution : `Send a facebook login request with the same details to sign the user in via facebook.`,
        data     : {
          id    : res.id,
          email : res.email
        }
      }, 400);
    }

    if (res) {
      throw error.parse({
        code     : `FB_EMAIL_EXISTS`,
        message  : `The email connected to this facebook account has already been registered in our system.`,
        solution : `Have the user sign in to the system and perform a facebook connect request.`,
        data     : {
          id    : res.id,
          email : res.email
        }
      }, 400);
    }
  }

  static *register(fb) {
    yield this.checkIfExists(fb);

    fb.facebook = fb.id;

    delete fb.id; // Remove facebook id value so not to over-write our system value.

    let data = changeCase.objectKeys('toCamel', fb);
    if (hooks.has('user:store:before')) {
      data = yield hooks.call('user:store:before', data);
    }

    // ### Register User

    let user = new User(data);
    yield user.save();

    // ### Assign Group
    // All new users are registered under the default group.

    let group = new GroupUser({
      groupId     : 1,
      userId      : user.id,
      groupRoleId : 1
    });
    yield group.save();

    yield hooks.call('user:store:after', user);

    relay.emit('users', {
      type : 'store',
      data : user.toJSON()
    });

    return user;
  }

  static *waitlist(fb) {
    yield this.checkIfExists(fb);

    fb.facebook = fb.id;

    delete fb.id;

    let data = changeCase.objectKeys('toCamel', fb);

    let res = yield waitlist.internalAdd(data);
    res.in = data;
    res._type = 'waitlist';
    return res;
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
