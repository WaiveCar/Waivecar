'use strict';

Bento.Register.Model('Car', 'sequelize', function register(model, Sequelize) {

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

    // ### Car Status
    // The current status of the car, if its available and what user is
    // currenty in possession of the car.

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
    },

    isLocked : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isImmobilized : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isIgnitionOn : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isKeySecure : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isChargeCardSecure : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
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

    isParked : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    // ### Car Details

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

    license : {
      type : Sequelize.STRING(88)
    },

    vin : {
      type : Sequelize.STRING(88)
    },

    fileId : {
      type : Sequelize.STRING
    },

    latitude : {
      type : Sequelize.DECIMAL(10, 8),
    },

    longitude : {
      type : Sequelize.DECIMAL(11, 8),
    },

    locationQuality : {
      type : Sequelize.INTEGER
    },

    distanceSinceLastRead : {
      type : Sequelize.DECIMAL(10, 2)
    },

    currentSpeed : {
      type : Sequelize.DECIMAL(10, 2)
    },

    calculatedSpeed : {
      type : Sequelize.DECIMAL(10, 2)
    },

    charge : {
      type : Sequelize.DECIMAL(10, 2)
    },

    lockLastCommand : {
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

    range : {
      type : Sequelize.DECIMAL(10, 2)
    },

    positionUpdatedAt : {
      type : Sequelize.DATE
    },

    lastServiceAt : {
      type : Sequelize.DATE
    },

    comments : {
      type : Sequelize.TEXT()
    }

  };

  model.attributes = [
    'bookingId'
  ];

  // ### Model Methods

  model.methods = {

    /**
     * Sets the car into unavailable mode.
     */
    unavailable : function *() {
      yield this.update({
        isAvailable : false
      });
    },

    /**
     * Sets the car into available mode.
     */
    available : function *() {
      yield this.update({
        isAvailable : true
      });
    },

    /**
     * Adds a driver to the car and sets the car to unavailable.
     * @param {Number} userId
     */
    addDriver : function *(userId) {
      yield this.update({
        userId      : userId,
        isAvailable : false
      });
    },

    /**
     * Removes driver from the car and sets the car to available.
     */
    removeDriver : function *() {
      yield this.update({
        userId : null
      });
    }

  };

  model.attributes = [
    'user'
  ];

  model.relations = [
    'User',
    function(User) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
    }
  ];

  return model;

});
