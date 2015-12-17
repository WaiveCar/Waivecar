'use strict';

Bento.Register.Model('BookingPayment', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_payments';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Booking ID
    // The booking id the payment is attached to.

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    // ### Order ID
    // The id of the order the payment is connected to.

    orderId : {
      type      : Sequelize.INTEGER,
      allowNull : false
    }

  };

  return model;

});
