'use strict';

let _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(Booking, _super);

  /**
   * @class Booking
   * @constructor
   * @param {object} data
   */
  function Booking(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  Booking.prototype._table = Booking._table = 'bookings';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  Booking.prototype._schema = Booking._schema = {
    attributes : {
      id         : 'INT(11) NOT NULL AUTO_INCREMENT',
      customerId : 'INT(11) NOT NULL',
      carId      : 'VARCHAR(28) NOT NULL',
      paymentId  : 'INT(11) NULL',
      state      : 'ENUM("pending", "started", "ended") DEFAULT "pending"'
    },
    primaryKey  : 'id',
    foreignKeys : [
      'FOREIGN KEY (customer_id) REFERENCES users(id)',
      'FOREIGN KEY (car_id) REFERENCES cars(id)',
      'FOREIGN KEY (payment_id) REFERENCES payments(id)'
    ]
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  Booking.prototype._blacklist = [
    'deletedAt'
  ];

  return Booking;

})();