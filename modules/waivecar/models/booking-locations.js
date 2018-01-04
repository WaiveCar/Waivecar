'use strict';

Bento.Register.Model('BookingLocation', 'sequelize', function(model, Sequelize) {

  model.table = 'booking_locations';
  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : true,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    carId : {
      type       : Sequelize.INTEGER,
      allowNull  : true
    },

    latitude : {
      type      : Sequelize.DECIMAL(10, 8),
      allowNull : false
    },

    longitude : {
      type      : Sequelize.DECIMAL(11, 8),
      allowNull : false
    }/*,

    hdop : {
      type      : Sequelize.DECIMAL(10, 2),
      allowNull : false
    }
    */
  };

  model.relations = [
    'Booking',
    function(Booking) {
      this.belongsTo(Booking);
    }
  ];

  return model;

});
