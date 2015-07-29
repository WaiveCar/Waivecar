'use strict';

let _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(CarLocation, _super);

  /**
   * @class CarLocation
   * @constructor
   * @param {object} data
   */
  function CarLocation(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  CarLocation.prototype._table = CarLocation._table = 'car_location';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  CarLocation.prototype._schema = CarLocation._schema = {
    attributes : {
      carId     : 'VARCHAR(28)    NOT NULL',
      latitude  : 'DECIMAL(10, 8) NOT NULL',
      longitude : 'DECIMAL(11, 8) NOT NULL'
    },
    primaryKey  : 'car_id',
    foreignKeys : 'FOREIGN KEY (car_id) REFERENCES cars(id)'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  CarLocation.prototype._blacklist = [ 'deletedBy', 'deletedAt' ];

  return CarLocation;

})();