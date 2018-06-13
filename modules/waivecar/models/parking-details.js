'use strict';

Bento.Register.Model('ParkingDetails', 'sequelize', (model, Sequelize) => {

  model.table = 'parking_details';

  model.schema = {

    bookingDetailId : {
      type       : Sequelize.INTEGER
    },

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

    streetOvernightRest : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    bookingId : {
      type       : Sequelize.INTEGER
    },

    path : {
      type       : Sequelize.STRING
    },
  };

  return model;

});
