'use strict';

var mysql = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(User, mysql);

  /**
   * @class User
   * @constructor
   * @param {object} data
   */
  function User(data) {
    mysql.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  User.prototype._table = User._table = 'users';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  User.prototype._schema = User._schema = {
    attributes : {
      id         : 'INT(11) NOT NULL AUTO_INCREMENT',
      role       : 'ENUM("user","admin") NOT NULL',
      firstName  : 'VARCHAR(28) NOT NULL',
      lastName   : 'VARCHAR(28) NOT NULL',
      email      : 'VARCHAR(128) NOT NULL',
      password   : 'VARCHAR(64) NULL',
      facebook   : 'VARCHAR(64) NULL',
      twitter    : 'VARCHAR(64) NULL',
      linkedin   : 'VARCHAR(64) NULL'
    },
    primaryKey : 'id',
    uniqueKeys : {
      email : ['email']
    }
  };

  /**
   * List of default values that are set instead of null when instancing a new model
   * @property _defaults
   * @type     Object
   */
  User.prototype._defaults = {
    role : 'user'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  User.prototype._blacklist = [
    'password'
  ];

  /**
   * @method name
   * @return {String}
   */
  User.prototype.name = function () {
    return this.firstName + ' ' + this.lastName;
  };

  return User;

})();