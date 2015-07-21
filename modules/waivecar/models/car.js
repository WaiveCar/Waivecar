'use strict';

let moment = require('moment');
let _super = Reach.service('mysql/model');
let query  = Reach.service('mysql/query');

module.exports = (function () {

  Reach.extends(Car, _super);

  /**
   * @class Car
   * @constructor
   * @param {object} data
   */
  function Car(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  Car.prototype._table = Car._table = 'cars';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  Car.prototype._schema = Car._schema = {
    attributes : {
      id                : 'VARCHAR(28)  NOT NULL',
      userId            : 'INT(11) DEFAULT NULL',
      make              : 'VARCHAR(28)  NOT NULL',
      model             : 'VARCHAR(88)  NOT NULL',
      year              : 'VARCHAR(4)   NOT NULL',
      manufacturer      : 'VARCHAR(28)  NOT NULL',
      phone             : 'VARCHAR(28)  NULL',
      unitType          : 'VARCHAR(28)  NULL', // Should convert to enum if we can get full list of unit types
      onstarStatus      : 'VARCHAR(28)  NULL', // SHould convert to enum if we can get full list of onstar status
      primaryDriverId   : 'VARCHAR(28)  NULL',
      primaryDriverUrl  : 'VARCHAR(256) NULL',
      url               : 'VARCHAR(256) NULL',
      isInPreActivation : 'ENUM("true","false") DEFAULT "false"'
    },
    primaryKey : 'id'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  Car.prototype._blacklist = [
    'deletedAt'
  ];

  /**
   * Attempts to insert data, if it already exists we attempt to update it instead.
   * @method upsert
   */
  Car.prototype.upsert = function *() {
    let result = yield query.upsert(this._table, this._data());

    this.createdAt = this.createdAt || moment().format('YYYY-MM-DD HH-mm-ss');
    this.updatedAt = this.createdAt ? moment().format('YYYY-MM-DD HH-mm-ss') : null;

    return result;
  };

  return Car;

})();