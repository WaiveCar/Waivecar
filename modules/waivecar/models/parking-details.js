'use strict';

Bento.Register.Model('ParkingDetails', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'parking_details';

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
    bookingDetailId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'booking_details',
        key   : 'id'
      }
    },

    /**
     * The detail type of the ride, start, or end.
     * @type {Enum}
     */
    type : {
      type      : Sequelize.ENUM('lot', 'street'),
      allowNull : false
    },

    lotFreePeriod : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    lotFreeHours : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotHours : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotMinutes : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotLevel : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotSpot : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotOvernightRest : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    streetSignImage : {
      type       : Sequelize.STRING,
      references : {
        model : 'files',
        key   : 'id'
      }
    },

    streetHours : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    streetMinutes : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    lotOvernightRest : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    }

  };

  return model;

});
