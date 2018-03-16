'use strict';

Bento.Register.Model('BookingDetails', 'sequelize', (model, Sequelize) => {

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

    /**
     * The booking id.
     * @type {Integer}
     */
    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    /**
     * The detail type of the ride, start, or end.
     * @type {Enum}
     */
    type : {
      type         : Sequelize.ENUM('start', 'end'),
      defaultValue : 'start'
    },

    /**
     * Latitude location of the car.
     * @type {Float}
     */
    latitude : {
      type : Sequelize.FLOAT(10, 7)
    },

    /**
     * Longitude location of the car.
     * @type {Float}
     */
    longitude : {
      type : Sequelize.FLOAT(10, 7)
    },

    /**
     * The aproximate location address of the car.
     * @type {String}
     */
    address : {
      type : Sequelize.STRING
    },

    /**
     * The total car mileage.
     * @type {Decimal}
     */
    mileage : {
      type : Sequelize.DECIMAL(10,2)
    },

    /**
     * The charge level of the car.
     * @type {Integer}
     */
    charge : {
      type : Sequelize.INTEGER
    }

  };

  model.relations = [
    'ParkingDetails',
    function relations(ParkingDetails) {
      this.hasMany(ParkingDetails, { as : 'parkingDetails', foreignKey : 'bookingDetailId' });
    }
  ];

  /**
   * Possible custom attributes attached to booking outside of schema.
   * @type {Array}
   */
  model.attributes = [
    'parkingDetails'
  ];

  return model;

});
