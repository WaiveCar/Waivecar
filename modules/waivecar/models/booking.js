'use strict';

Reach.Register.Model('Booking', 'sequelize', function (model, Sequelize) {
  
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'bookings';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    customerId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },
    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },
    paymentId : { type : Sequelize.INTEGER },
    state     : {
      type : Sequelize.ENUM(
        'new-booking',
        'payment-authorized',
        'pending-arrival',
        'in-progress',
        'pending-payment',
        'cancelled',
        'completed'
      ),
      defaultValue : 'new-booking'
    }
  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = ['BookingDetails', function (BookingDetails) {
    this.hasMany(BookingDetails, { as : 'details', foreignKey : 'bookingId' });
  }];

  /**
   * Attributes that can be provided that is not part of the model schema.
   * @property attributes
   * @type     Array
   */
  model.attributes = [ 'details' ];

  return model;

});