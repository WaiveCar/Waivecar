'use strict';

let moment = require('moment');
let _super = Reach.service('mysql/model');
let query  = Reach.service('mysql/query');

module.exports = (function () {

  Reach.extends(Location, _super);

  /**
   * @class Car
   * @constructor
   * @param {object} data
   */
  function Location(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  Location.prototype._table = Location._table = 'locations';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  Location.prototype._schema = Location._schema = {
    attributes : {
      id          : 'INT(11) NOT NULL AUTO_INCREMENT',
      type        : 'VARCHAR(28) NOT NULL',
      name        : 'VARCHAR(28) NOT NULL',
      description : 'VARCHAR(28) NULL',
      lat         : 'FLOAT(10, 6) NOT NULL',
      long        : 'FLOAT(10, 6) NOT NULL',
      address     : 'VARCHAR(28) NULL',
    },
    primaryKey : 'id'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  Location.prototype._blacklist = [
    'deletedAt'
  ];

  /**
   * Attempts to insert data, if it already exists we attempt to update it instead.
   * @method upsert
   */
  Location.prototype.upsert = function *() {
    let result = yield query.upsert(this._table, this._data());

    this.createdAt = this.createdAt || moment().format('YYYY-MM-DD HH-mm-ss');
    this.updatedAt = this.createdAt ? moment().format('YYYY-MM-DD HH-mm-ss') : null;

    return result;
  };

  /* istanbul ignore next: _owner needs koa instance only used by modules */

  /**
   * Verifies the ownership of the model with the provided user, if the user is not
   * owner or admin a 401 ERROR is produced.
   * @method _owner
   * @param  {object} self Koa request/response object
   * @return {boolean}
   */
  Location.prototype._owner = function *(self) {
    let user = self.auth.user;
    if (this.userId.toString() !== user.id.toString() && 'admin' !== user.role) {
      self.throw({
        code    : 'ACCESS_DENIED',
        message : 'You do not have the required privileges to edit this location'
      }, 401);
    }
    return true;
  };

  return Location;

})();