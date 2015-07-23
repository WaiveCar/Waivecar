'use strict';

let _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(BookingDetails, _super);

  /**
   * @class BookingDetails
   * @constructor
   * @param {object} data
   */
  function BookingDetails(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  BookingDetails.prototype._table = BookingDetails._table = 'booking_details';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  BookingDetails.prototype._schema = BookingDetails._schema = {
    attributes : {
      id        : 'INT(11) NOT NULL AUTO_INCREMENT',
      bookingId : 'INT(11) NOT NULL',
      type      : 'ENUM("start", "end") DEFAULT "start"',
      time      : 'DATETIME NULL',
      latitude  : 'FLOAT(10, 7) NULL',
      longitude : 'FLOAT(10, 7) NULL',
      odometer  : 'INT(7) NULL',
      charge    : 'TINYINT(3) NULL',
    },
    primaryKey  : 'id',
    foreignKeys : 'FOREIGN KEY (booking_id) REFERENCES bookings(id)'
  };

  /**
   * Attributes to remove before returning model.toJSON()
   * @property _blacklist
   * @type     Array
   */
  BookingDetails.prototype._blacklist = [
    'deletedAt'
  ];

  return BookingDetails;

})();