'use strict';

Bento.Register.Model('BookingLocation', 'sequelize', function(model, Sequelize) {

  model.table = 'booking_locations';

  // we don't care about these fields.
  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };

  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : true,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    latitude : {
      type      : Sequelize.DECIMAL(10, 8),
      allowNull : false
    },

    longitude : {
      type      : Sequelize.DECIMAL(11, 8),
      allowNull : false
    }
  };

  model.relations = [
    'Booking',
    function(Booking) {
      this.belongsTo(Booking);
    }
  ];

  return model;

});
