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
