'use strict';

var bcrypt = require('co-bcrypt');
var query  = reach.service('mysql/query');
var _super = reach.service('mysql/model');

/**
 * @class User
 * @constructor
 * @param {object} data
 */
module.exports = (function () {

  Reach.extends(User, _super);

  /**
   * @class User
   * @constructor
   * @param {object} data
   */
  function User(data) {
    _super.call(this, data);
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
      role       : 'ENUM("user","admin") NOT NULL DEFAULT "user"',
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
   * Adds the user to the database.
   * @method save
   * @return {object}
   */
  User.prototype.save = function *() {
    this.password = this.password ? yield bcrypt.hash(this.password, 10) : null;

    var result = yield query.insert(this._table, {
      firstName : this.firstName,
      lastName  : this.lastName,
      email     : this.email,
      password  : this.password,
      facebook  : this.facebook
    });

    this.id        = result.insertId;
    this.role      = this.role || 'user';
    this.createdAt = Date.now();
  };

  /**
   * @static
   * @method find
   * @param  {object} options
   * @return {array}  users
   */
  User.find = function *(options) {
    var result = yield query.select('users', options);
    if (!result) {
      return result;
    }
    if (options && options.limit && 1 === options.limit) {
      return new User(result);
    }
    result.forEach(function (user, index) {
      result[index] = new User(user);
    });
    return result;
  };

  /**
   * @method update
   * @param  {object} data
   * @return {object}
   */
  User.prototype.update = function *(data) {
    yield query('UPDATE users SET ?, updated_at = NOW() WHERE id = ?', [data, this.id]);
    for (var key in data) {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
    this.updatedAt = Date.now();
  };

  /**
   * @method delete
   * @return {object}
   */
  User.prototype.delete = function *() {
    yield query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [this.id]);
  };

  return User;

})();