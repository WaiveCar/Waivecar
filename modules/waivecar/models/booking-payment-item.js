'use strict';

Bento.Register.Model('BookingPaymentItem', 'sequelize', function register(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_payment_items';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Payment ID
    // The booking this payment belongs to.

    paymentId : {
      type      : Sequelize.INTEGER,
      allowNull : false
    },

    name : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    quantity : {
      type         : Sequelize.INTEGER,
      defaultValue : 1
    },

    amount : {
      type      : Sequelize.INTEGER,
      allowNull : false
    }

  };

  return model;

});
