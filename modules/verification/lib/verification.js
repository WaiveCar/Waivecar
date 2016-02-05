'use strict';

let tokens = Bento.provider('token');
let hooks  = Bento.Hooks;
let error  = Bento.Error;
let errors = Bento.module('user/lib/errors');
let User   = Bento.model('User');

module.exports = class VerificationService {

  /**
   * Sends verification request based on provided post.
   * @param  {String} type    The purpose/type of the verification.
   * @param  {Object} payload The post payload provided.
   * @param  {Object} _user   The authenticated user.
   * @return {Mixed}
   */
  static *send(type, payload, _user) {
    let send = hooks.get('verification:send', true);
    return yield send(type, _user, payload);
  }

  /**
   * Allows the sending of verification requests on behalf of another user
   * @param  {String} type    The purpose/type of the verification.
   * @param  {String} id      ID of user to send verification
   * @param  {Object} payload The post payload provided.
   * @param  {Object} _user   The authenticated user.
   */
  static *sendUser(type, id, payload, _user) {
    let user = yield User.findById(id);

    if (!user) throw errors.userNotFound();
    if (user.id !== _user.id || !_user.hasAccess('admin')) throw errors.userUpdateRefused();

    return yield this.send(type, payload, user);
  }

  /**
   * Loads the payload under the provided token and executes the
   * handle hook for further actions.
   * @param  {String} token
   * @param  {Object} _user
   * @return {Void}
   */
  static *handle(token, _user) {
    let handle  = hooks.get('verification:handle', true);
    let payload = yield tokens.get(token);

    // ### Handle Verification Token
    // Send the payload to the verification handler hook, once it
    // has been successfully handled we delete the token.

    yield handle(_user, payload);
    yield tokens.delete(token);
  }

  /**
   * Returns a payload stored under a registered token.
   * @param  {String} token
   * @param  {Object} _user The authenticated user.
   * @return {Object}
   */
  static *get(token, _user) {
    return yield payload(token, _user);
  }

};

/**
 * Returns a payload stored under a registered token.
 * @param  {String} token
 * @param  {Object} _user The authenticated user.
 * @return {Object}
 */
function *payload(token, _user) {
  let payload = yield tokens.get(token);
  if (_user.id !== payload.user && _user.role !== 'admin') {
    throw error.parse({
      code    : 'INVALID_CREDENTIALS',
      message : 'You do not have the required permissions to view the token payload.'
    }, 401);
  }
  return payload;
}
