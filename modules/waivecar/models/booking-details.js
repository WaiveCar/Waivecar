'use strict';

Bento.Register.Model('BookingDetails', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_details';

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
    type : {
      type         : Sequelize.ENUM('start', 'end'),
      defaultValue : 'start'
    },
    time      : { type : Sequelize.DATE },
    latitude  : { type : Sequelize.FLOAT(10, 7) },
    longitude : { type : Sequelize.FLOAT(10, 7) },
    odometer  : { type : Sequelize.INTEGER },
    charge    : { type : Sequelize.INTEGER }
  };

  return model;

});