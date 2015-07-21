'use strict';

var mysql = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(Group, mysql);

  /**
   * @class Group
   * @constructor
   * @param {object} data
   */
  function Group(data) {
    mysql.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  Group.prototype._table = Group._table = 'groups';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  Group.prototype._schema = Group._schema = {
    attributes : {
      id        : 'INT(11) NOT NULL AUTO_INCREMENT',
      creatorId : 'INT(11) NOT NULL',
      name      : 'VARCHAR(88) NOT NULL'
    },
    primaryKey  : 'id',
    foreignKeys : 'FOREIGN KEY (creator_id) REFERENCES users(id)'
  };

  return Group;

})();