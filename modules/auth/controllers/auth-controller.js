'use strict';

let Facebook = Reach.Auth.Facebook;
let User     = Reach.model('User');

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
    yield this.auth.login(post.email, post.password);

    return this.auth.user;
  };

  /**
   * @method logout
   * @return {Object}
   */
  AuthController.prototype.logout = function *() {
    if (!this.auth.check()) {
      return null;
    }
    return yield this.auth.logout();
  };

  /**
   * @method facebook
   */
  AuthController.prototype.facebook = function *(post) {
    let facebook    = new Facebook(Reach.config.facebook);
    let accessToken = yield facebook.accessToken(post.code, post.redirectUri);
    let profile     = yield facebook.profile(accessToken);
    let user        = yield User.findOne({ facebook : profile.id });

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
    if (!this.auth.check()) {
      return null;
    }
    yield this.auth.remember();
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