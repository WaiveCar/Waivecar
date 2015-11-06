'use strict';

Bento.Register.Model('Car', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'cars';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    id : {
      type       : Sequelize.STRING(28),
      primaryKey : true
    },

    make : {
      type : Sequelize.STRING(28)
    },

    model : {
      type : Sequelize.STRING(88)
    },

    year : {
      type : Sequelize.STRING(4)
    },

    manufacturer : {
      type : Sequelize.STRING(88)
    },

    latitude  : {
      type : Sequelize.DECIMAL(10, 8),
    },

    longitude : {
      type : Sequelize.DECIMAL(11, 8),
    },

    distanceSinceLastRead : {
      type : Sequelize.DECIMAL(10, 2)
    },

    currentSpeed: {
      type : Sequelize.DECIMAL(10, 2)
    },

    fuel: {
      type : Sequelize.DECIMAL(10, 2)
    },

    isImmobilized: {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    ignition: {
      type : Sequelize.STRING(28)
    },

    isLocked: {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    lockLastCommand : {
      type : Sequelize.STRING(28)
    },

    keyfob : {
      type : Sequelize.STRING(28)
    },

    bluetooth : {
      type : Sequelize.STRING(28)
    },

    alarmInput : {
      type : Sequelize.STRING(28)
    },

    mileageSinceImmobilizerUnlock : {
      type : Sequelize.INTEGER
    },

    totalMileage : {
      type : Sequelize.DECIMAL(10, 2)
    },

    boardVoltage : {
      type : Sequelize.DECIMAL(10, 2)
    },

    isCharging : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isQuickCharging : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isOnChargeAdapter : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    range : {
      type : Sequelize.DECIMAL(10, 2)
    },

    // ### Car Status
    // This holds information such as the availability of the car
    // and the current user who is occupying the car.
    userId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    isAvailable : {
      type         : Sequelize.BOOLEAN,
      defaultValue : true
    }

  };

  return model;

});
