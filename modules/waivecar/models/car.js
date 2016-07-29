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

    adminOnly : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
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

    chargeHistory: {
      type : Sequelize.STRING
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

  // ### Model Methods

  model.methods = {

    getChargeHistory : function () {
      return JSON.parse(this.chargeHistory) || [];
    },

    addToHistory : function (what) {
      // TODO: find out where constants can be stored for
      // scoped access.
      let history_length = 4;
      let history = this.getChargeHistory();

      if (history.length > history_length) {
        history.shift();
      }
      history.push(what);
      this.chargeHistory = JSON.stringify(history);
    },
   
    averageCharge : function () {
      let history = this.getChargeHistory();
      let total = history.reduce(function(current, sum) { return current + sum } );
      return total / history.length;
    },

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

    hidden : function *() {
      yield this.update({
        adminOnly : true
      });
    },

    visible : function *() {
      yield this.update({
        adminOnly : false
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
    'bookingId',
    'lastBooking',
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
