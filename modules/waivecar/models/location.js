'use strict';

Bento.Register.Model('Location', 'sequelize', function(model, Sequelize) {

  model.table = 'locations';

  model.schema = {

    type : {
      type         : Sequelize.ENUM('station', 'valet', 'homebase', 'item-of-interest', 'dropoff'),
      defaultValue : 'station'
    },

    name : { type : Sequelize.STRING, allowNull : false },

    description : { type : Sequelize.STRING },

    comments : { type : Sequelize.TEXT() },

    latitude : { type : Sequelize.DECIMAL(10, 8), allowNull : false },

    longitude : { type : Sequelize.DECIMAL(11, 8), allowNull : false },

    address : { type : Sequelize.STRING },

    // I guess these will be in US feet because that's
    // how americans roll. What a silly system.
    radius : {
      type       : Sequelize.INTEGER,
      allowNull  : true
    },

    status : {
      type : Sequelize.ENUM(
        'available',
        'unavailable',
        'unknown'
      ),
      defaultValue : 'available'
    }
  };

  return model;

});
