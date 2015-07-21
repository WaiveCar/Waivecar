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
      type        : 'ENUM("station","item-of-interest") DEFAULT "station"',
      name        : 'VARCHAR(255) NOT NULL',
      description : 'VARCHAR(255) NULL',
      latitude    : 'DECIMAL(10, 8) NOT NULL',
      longitude   : 'DECIMAL(11, 8) NOT NULL',
      address     : 'VARCHAR(255) NULL'
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

  return Location;

})();