/*
  UsersController
  ===============

  Stability: 3 - Stable

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

module.exports = Reach.resource(function (_super) {

  Reach.extends(UsersController, _super);

  /**
   * @class UsersController
   */
  function UsersController() {
    _super.call(this, 'user', Reach.model('User'));
  }

  /**
   * Returns the profile of the authenticated user
   * @method me
   * @return {object}
   */
  UsersController.prototype.me = function *() {
    return this.user.toJSON();
  };

 return UsersController;

});