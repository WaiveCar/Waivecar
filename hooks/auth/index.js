'use strict';

let bcrypt    = Bento.provider('bcrypt');
let User      = Bento.model('User');
let GroupUser = Bento.model('GroupUser');
let auth      = Bento.Auth;
let hooks     = Bento.Hooks;
let error     = Bento.Error;

/**
 * Authentication hook for standard login attempts.
 * @param  {Object} payload The authentication payload.
 * @return {Object}
 */
hooks.set('auth:login', function *(payload) {
  let user = yield getUser(payload.identifier);
  if (!user) {
    throw invalidCredentials('The email is unrecognized. Please check the spelling.');
  }

  if(user.status === 'waitlist') {
    throw error.parse({
      code    : `AUTH_INVALID_GROUP`,
      message : `You're currently on the waitlist. We'll contact you when you're account is active.`
    }, 400);
  }

  if(!user.password) {
    throw invalidCredentials('You signed up through Facebook.');
  }

  let password = yield bcrypt.compare(payload.password, user.password);
  if (!password) {
    throw invalidCredentials('We found an account with that email but the password is incorrect. Please try again.');
  }

  yield verifyUser(user, payload);

  return yield auth.token(user.id, payload);
});

/**
 * Verification hook for social login attempts.
 * @param  {Object} user
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('auth:social', function *(user, payload) {
  yield verifyUser(user, payload);
  if(user.status === 'waitlist' && user.phone) {
    throw error.parse({
      code    : `AUTH_INVALID_GROUP`,
      message : `You're currently on the waitlist. We'll contact you when you're account is active.`
    }, 400);
  }
  return yield auth.token(user.id, payload);
});

/**
 * Checks group and account status.
 * @param  {Object} user
 * @param  {Object} payload
 * @return {Void}
 */
function *verifyUser(user, payload) {
  // Api: Suspended users should be able to be log in and update credit cards #484
  //
  // Ideally what you want to do is permit the user to log in but then return a crafted
  // message under the umbrella of a successful login which directs them to fix their CC.
  //
  // This is the ideal situation. The easier one for now is to piggy-back on the prohibition
  // of booking for suspended accounts (this is good) and to then tell them to update their
  // credit card in that message. (cjm 20160727)
  //
  // if (user.status === 'suspended') {
  //   throw accountSuspended();
  // }
  //
  
  let group = yield getGroup(user.id, payload.group || 1);
  if (!group) {
    throw invalidGroup();
  }
}

function *getUser(identifier) {
  return yield User.findOne({
    where : {
      email : identifier
    }
  });
}

function *getGroup(userId, groupId) {
  return yield GroupUser.findOne({
    where : {
      groupId : groupId,
      userId  : userId
    }
  });
}

function invalidCredentials(msg) {
  return error.parse({
    code    : `AUTH_INVALID_CREDENTIALS`,
    message : msg || 'We didn’t find your account, please try again'
  }, 400);
}

function invalidGroup() {
  return error.parse({
    code    : `AUTH_INVALID_GROUP`,
    message : `Your account does not have access to requested group.`
  }, 400);
}

function accountSuspended() {
  return error.parse({
    code    : 'AUTH_ACCOUNT_SUSPENDED',
    message : `Your account has been suspended, contact support for more information.`
  }, 400);
}
