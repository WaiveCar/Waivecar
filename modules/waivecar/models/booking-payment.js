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

    // ### Payment ID
    // The payment this payment belongs to.

    paymentId : {
      type       : Sequelize.INTEGER,
      primaryKey : true
    },

    // ### Booking ID
    // The booking this payment belongs to.

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    }

  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = [
    'BookingPaymentItem',
    function(BookingPaymentItem) {
      this.hasMany(BookingPaymentItem, { as : 'items',  foreignKey : 'paymentId' });
    }
  ];

  return model;

});
