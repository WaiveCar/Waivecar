'use strict';

var _super = Reach.service('mysql/model');

module.exports = (function () {

  Reach.extends(PaymentCard, _super);

  /**
   * @class PaymentCard
   * @constructor
   * @param {object} data
   */
  function PaymentCard(data) {
    _super.call(this, data);
  }

  /**
   * The name of the table to use for this model.
   * @property _table
   * @type     String
   */
  PaymentCard.prototype._table = PaymentCard._table = 'payment_cards';

  /**
   * Your models database schema.
   * @property _schema
   * @type     Object
   */
  PaymentCard.prototype._schema = PaymentCard._schema = {
    attributes : {
      id         : 'VARCHAR(64) NOT NULL',
      customerId : 'INT(11) NOT NULL',
      last4      : 'VARCHAR(4) NULL',
      brand      : 'ENUM("Visa", "American Express", "MasterCard", "Discover", "JCB", "Diners Club", "Unknown")',
      expMonth   : 'TINYINT(2) NOT NULL',
      expYear    : 'SMALLINT(4) NOT NULL'
    },
    primaryKey  : 'id',
    foreignKeys : 'FOREIGN KEY (customer_id) REFERENCES users(id)'
  };

  return PaymentCard;

})();