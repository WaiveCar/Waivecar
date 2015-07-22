'use strict';

let _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(CarStatus, _super);

  /**
   * @class CarStatus
   * @constructor
   * @param {object} data
   */
  function CarStatus(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  CarStatus.prototype._table = CarStatus._table = 'car_status';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  CarStatus.prototype._schema = CarStatus._schema = {
    attributes : {
      carId    : 'VARCHAR(28) NOT NULL',
      driverId : 'INT(11) NULL',
      status   : 'ENUM("available", "unavailable") DEFAULT "available"'
    },
    foreignKeys : [
      'FOREIGN KEY (car_id) REFERENCES cars(id)',
      'FOREIGN KEY (driver_id) REFERENCES users(id)'
    ],
    uniqueKeys : {
      carId : ['car_id']
    }
  };

  /**
   * List of default values that are set instead of null when instancing a new model
   * @property _defaults
   * @type     Object
   */
  CarStatus.prototype._defaults = {
    status : 'available'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  CarStatus.prototype._blacklist = [
    'deletedAt'
  ];

  return CarStatus;

})();