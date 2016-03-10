'use strict';

Bento.Register.Model('BookingLocation', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_locations';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
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

  return model;

});
