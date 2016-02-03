'use strict';

let error     = require('./errors');
let GroupRole = Bento.model('GroupRole');

module.exports = {

  /**
   * Returns an indexed array of system roles.
   * @return {Array}
   */
  *index() {
    return Bento.Interface.roles;
  },

  /**
   * Returns an indexed array of group roles.
   * @param  {Number} id
   * @return {Array}
   */
  *groupIndex(id, _user) {
    if (parseInt(id) !== _user.group.id) {
      throw error.rolesInvalidCredentials();
    }
    return yield GroupRole.find({
      where : {
        groupId : id
      }
    });
  }

};
