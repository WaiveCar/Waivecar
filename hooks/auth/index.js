'use strict';

let bcrypt    = Bento.provider('bcrypt');
let User      = Bento.model('User');
let GroupUser = Bento.model('GroupUser');
let auth      = Bento.Auth;
let hooks     = Bento.Hooks;
let error     = Bento.Error;

/**
 * @param  {Object} payload The authentication payload.
 * @return {Object}
 */
hooks.set('auth:login', function *(payload) {
  let user = yield getUser(payload.identifier);
  if (!user) {
    throw invalidCredentials();
  }

  let password = yield bcrypt.compare(payload.password, user.password);
  if (!password) {
    throw invalidCredentials();
  }

  let group = yield getGroup(user.id, payload.group || 1);
  if (!group) {
    throw invalidGroup();
  }

  return yield auth.token(user.id, payload);
});

/**
 * Returns user for identifier authentication.
 * @param  {String} identifier
 * @return {Object}
 */
function *getUser(identifier) {
  return yield User.findOne({
    where : {
      email : identifier
    }
  });
}

/**
 * Returns a group.
 * @param  {Number} userId
 * @param  {Number} groupId
 * @return {Object}
 */
function *getGroup(userId, groupId) {
  return yield GroupUser.findOne({
    where : {
      groupId : groupId,
      userId  : userId
    }
  });
}

/**
 * Returns a invalid credentials error.
 * @return {Object}
 */
function invalidCredentials() {
  return error.parse({
    code    : `AUTH_INVALID_CREDENTIALS`,
    message : `The credentials provided does not match any user in our database.`
  }, 400);
}

/**
 * Returns a invalid group error.
 * @return {Object}
 */
function invalidGroup() {
  return error.parse({
    code    : `AUTH_INVALID_GROUP`,
    message : `Your account does not have access to requested group.`
  }, 400);
}
