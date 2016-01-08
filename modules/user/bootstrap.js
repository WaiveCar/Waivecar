'use strict';

let error     = require('./lib/errors');
let bcrypt    = Bento.provider('bcrypt');
let User      = Bento.model('User');
let GroupUser = Bento.model('GroupUser');
let type      = Bento.Helpers.Type;
let config    = Bento.config.user;

module.exports = function *() {
  let count = yield User.count();
  if (!count) {
    let users = getUsers();
    for (let i = 0, len = users.length; i < len; i++) {
      let data = users[i];

      // ### Create User

      let user = new User(data);
      user.password = yield bcrypt.hash(user.password, 10);
      yield user.save();

      // ### Assign Group

      let group = new GroupUser({
        userId      : user.id,
        groupId     : data.group || 1,
        groupRoleId : data.role  || 1
      });
      yield group.save();
    }
  }
};

/**
 * Returns a list of users.
 * @return {Array}
 */
function getUsers() {
  return config.users || [];
}
