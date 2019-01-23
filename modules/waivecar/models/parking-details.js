'use strict';

Bento.Register.Model('ParkingDetails', 'sequelize', (model, Sequelize) => {

  model.table = 'parking_details';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };

  model.schema = {

    bookingDetailId : {
      type       : Sequelize.INTEGER
    },

    streetSignImage : {
      type       : Sequelize.STRING,
      references : {
        model : 'files',
        key   : 'id'
      }
    },

    bookingId : {
      type       : Sequelize.INTEGER
    },

    path : {
      type       : Sequelize.STRING
    },

    isBlurry : {
      type       : Sequelize.BOOLEAN
    },
    isNotsign : {
      type       : Sequelize.BOOLEAN
    },
    isWrong : {
      type       : Sequelize.BOOLEAN
    },
    isLawless : {
      type       : Sequelize.BOOLEAN
    },
    userInput : {
      type       : Sequelize.STRING(255),
    },
    expiresAt : {
      type      : Sequelize.DATE
    }
  };

  return model;

});
