/*
  AuthController
  ==============
  @author Christoffer Rødvik
  @github https://github.com/kodemon/reach-api
 */

'use strict';

var Facebook = Reach.service('auth/facebook');
var User     = Reach.model('User');

module.exports = (function () {

  /**
   * @class UserController
   */
  function AuthController() {}

  /**
   * @method login
   * @param  {object} post
   * @return {object}
   */
  AuthController.prototype.login = function *(post) {
    return yield this.auth.login(post.email, post.password);
  };

  /**
   * @method logout
   * @return {Object}
   */
  AuthController.prototype.logout = function *() {
    return yield this.auth.logout();
  };

  /**
   * @method facebook
   */
  AuthController.prototype.facebook = function *(post) {
    var facebook    = new Facebook(Reach.config.facebook);
    var accessToken = yield facebook.accessToken(post.code, post.redirectUri);
    var profile     = yield facebook.profile(accessToken);
    var user        = yield User.findOne({ facebook : profile.id });

    // ### Handle Admin App

    if ('admin' === this.from) {
      if (null === user || 'admin' !== user.role) {
        this.throw('You do not have the required access rights', 401);
      }
      return { token : yield this.auth.token(user.id) };
    }

    // ### Handle Public App

    if (user) {
      return { token : yield this.auth.token(user.id) };
    }

    // ### Register User

    user = new User({
      firstName : profile.first_name,
      lastName  : profile.last_name,
      email     : profile.email,
      facebook  : profile.id
    });

    yield user.save();

    return {
      token : yield this.auth.token(user.id)
    };
  };

  /**
   * @method remember
   * @return {void}
   */
  AuthController.prototype.remember = function *() {
    return null;
  };

  /**
   * @method logout
   * @return {void}
   */
  AuthController.prototype.logout = function *() {
    return null;
  };

  /**
   * @method validate
   * @return {void}
   */
  AuthController.prototype.validate = function *() {
    return null;
  };

  return AuthController;

})();