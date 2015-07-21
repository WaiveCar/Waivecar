'use strict';

var mysql = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(GroupUser, mysql);

  /**
   * @class GroupUser
   * @constructor
   * @param {object} data
   */
  function GroupUser(data) {
    mysql.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  GroupUser.prototype._table = GroupUser._table = 'group_users';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  GroupUser.prototype._schema = GroupUser._schema = {
    attributes : {
      groupId : 'INT(11) NOT NULL',
      userId  : 'INT(11) NOT NULL'
    },
    foreignKeys : [
      'FOREIGN KEY (group_id) REFERENCES groups(id)',
      'FOREIGN KEY (user_id) REFERENCES users(id)'
    ]
  };

  return GroupUser;

})();