'use strict';

Bento.Register.Model('Location', 'sequelize', function(model, Sequelize) {

  model.table = 'locations';

  model.schema = {

    type : {
      type         : Sequelize.ENUM('station', 'valet', 'homebase', 'item-of-interest', 'hub', 'zone', 'user-parking'),
      defaultValue : 'station'
    },

    name : { 
      type : Sequelize.STRING
    },

    description : { type : Sequelize.STRING },

    isPublic : { type : Sequelize.BOOLEAN, defaultValue : false },

    comments : { type : Sequelize.TEXT() },

    latitude : { type : Sequelize.DECIMAL(10, 8) },

    longitude : { type : Sequelize.DECIMAL(11, 8) },

    address : { type : Sequelize.STRING },

    // I guess these will be in US feet because that's
    // how americans roll. What a silly system.
    radius : {
      type       : Sequelize.INTEGER,
      allowNull  : true
    },

    shape : {
      type       : Sequelize.STRING,
      allowNull  : true
    },
  
    restrictions : {
      type       : Sequelize.STRING,
      allowNull  : true
    },
  
    streetType : {
      type       : Sequelize.STRING,
      allowNull  : true
    },

    status : {
      type : Sequelize.ENUM(
        'available',
        'unavailable',
        'unknown'
      ),
      defaultValue : 'available'
    },

    parkingTime : {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    minimumCharge : {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    }
  };

  return model;

});
