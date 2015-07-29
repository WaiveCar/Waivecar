'use strict';

let _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(CarDiagnostics, _super);

  /**
   * @class CarDiagnostics
   * @constructor
   * @param {object} data
   */
  function CarDiagnostics(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  CarDiagnostics.prototype._table = CarDiagnostics._table = 'car_diagnostics';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  CarDiagnostics.prototype._schema = CarDiagnostics._schema = {
    attributes : {
      carId   : 'VARCHAR(28)  NOT NULL',
      type    : 'VARCHAR(64)  NOT NULL',
      status  : 'VARCHAR(28)  NULL',
      message : 'VARCHAR(28)  NULL',
      value   : 'VARCHAR(128) NULL',
      unit    : 'VARCHAR(28)  NULL'
    },
    primaryKey  : 'car_id',
    foreignKeys : 'FOREIGN KEY (car_id) REFERENCES cars(id)'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  CarDiagnostics.prototype._blacklist = [ 'deletedBy', 'deletedAt' ];

  return CarDiagnostics;

})();