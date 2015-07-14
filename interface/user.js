'use strict';

var bcrypt = require('co-bcrypt');
var mysql  = Reach.service('mysql/model');

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
   * Verifies the ownership of the model with the provided user, if the user is not
   * owner or admin a 401 ERROR is produced.
   * @method _owner
   * @param  {object} self Koa request/response object
   * @return {boolean}
   */
  User.prototype._owner = function *(self) {
    var user = self.user;
    if (this.id.toString() !== user.id.toString() && 'admin' !== user.role) {
      self.throw({
        code    : 'ACCESS_DENIED',
        message : 'You do not have the required privileges to edit this user'
      }, 401);
    }
    return true;
  };

  /**
   * BCrypts the provided password and assigns it to the user.
   * @method preparePassword
   * @param  {String} password
   */
  User.prototype.preparePassword = function *(password) {
    this.password = yield bcrypt.hash(password, 10);
  };

  return User;

})();