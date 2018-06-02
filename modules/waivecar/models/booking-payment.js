'use strict';

Bento.Register.Model('BookingPayment', 'sequelize', function(model, Sequelize) {

  model.table = 'booking_payments';

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

  model.attributes = [
    'shopOrder'
  ];

  model.relations = [
    'Shop/Order',
    function(ShopOrder) {
      this.hasOne(ShopOrder, { as : 'shopOrder', foreignKey : 'order_id' });
    }
  ];

  return model;

});
