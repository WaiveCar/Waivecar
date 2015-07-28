'use strict';

var _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(Payment, _super);

  /**
   * @class Payment
   * @constructor
   * @param {object} data
   */
  function Payment(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  Payment.prototype._table = Payment._table = 'payments';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  Payment.prototype._schema = Payment._schema = {
    attributes : {
      id         : 'INT(11) NOT NULL AUTO_INCREMENT',
      customerId : 'INT(11) NULL',
      serviceId  : 'INT(11) NULL',
      total      : 'INT(11) NOT NULL'
    },
    primaryKey  : 'id',
    foreignKeys : 'FOREIGN KEY (customer_id) REFERENCES users(id)'
  };

  return Payment;

})();