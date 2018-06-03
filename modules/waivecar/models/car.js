'use strict';

let apiConfig   = Bento.config.api;
let Booking = Bento.model('Booking');

let Utils = require('sequelize/lib/utils');
require('./log');
let Log = Bento.model('Log');

Bento.Register.Model('Car', 'sequelize', function register(model, Sequelize) {

  model.table = 'cars';

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
      defaultValue : false
    },

    adminOnly : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isLocked : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isDoorOpen : {
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

    isWaivework : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    inRepair : {
      type         : Sequelize.BOOLEAN,
      defaultValue : true
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

    licenseUsed : {
      type : Sequelize.STRING(88)
    },

    vin : {
      type : Sequelize.STRING(88)
    },

    plateNumber : {
      type : Sequelize.STRING(16)
    },

    fileId : {
      type : Sequelize.STRING
    },

    latitude : {
      type : Sequelize.DECIMAL(10, 8)
    },

    longitude : {
      type : Sequelize.DECIMAL(11, 8)
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
      type : Sequelize.TEXT()
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

    mileageLastCharge : {
      type : Sequelize.DECIMAL(10, 2)
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

    getCurrentBooking: function *() {
      return yield Booking.findOne({ 
        where : { 
          car_id : this.id,
          status : {
            $in : ['started', 'reserved', 'ended']
          }
        },
        order: [['created_at', 'DESC']]
      });
    },

    link: function() {
      return `<${ apiConfig.uri }/cars/${ this.id }|${ this.license }>`;
    },

    // get last log for current car
    getLastAction: function *() {
      return yield Log.findOne({
        where : {
          car_id : this.id
        },
        order: [['created_at', 'DESC']]
      });
    },

    // get last log for all cars
    getLastActionForAllCars: function *() {
      let sequelize = Bento.provider('sequelize');

      // mysql for some reason chokes on the subquery so we approach this a different way
      let idListSQL = yield sequelize.query('SELECT MAX(id) as m FROM logs GROUP BY car_id');
      let idList = idListSQL[0].map((row) => {
        return row.m;
      });

      return yield Log.find({
        where : {
          id : {
            $in : idList
          }
        }
      });
    },

    getChargeHistory : function () {
      return JSON.parse(this.chargeHistory) || [];
    },

    info : function () {
      return this.license || this.id;
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
   
    getRange: function() {
      if(this.model === "Spark EV") { 
        return 70;
      } else {
        return 135;
      }
    },

    milesAvailable: function () {
      // charge is 0-100
      return (this.charge * this.getRange()) / 100;
    },

    averageCharge : function () {
      let history = this.getChargeHistory();

      // If there is a history then we compute this function. Otherwise
      // we just return the charge as the "average"
      if (history.length > 0) {
        let total = history.reduce(function(current, sum) { return current + sum } );
        return total / history.length;
      }
      return this.charge;
    },

    //
    // This is similar to the active charge above and really is designed
    // to address [Api: Report the full number of the average charge #545]
    // Essentially it returns a consistent human readable string that
    // consists of the average charge and charge history.
    //
    chargeReport : function () {
      return `${ this.averageCharge() }% (${ this.getChargeHistory().join(', ') })`;
    },

    // Sets the car into unavailable mode.
    unavailable : function *() {
      yield this.update({
        isAvailable : false
      });
    },

    // Sets the car into available mode.
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

    addDriver : function *(userId) {
      yield this.update({
        userId      : userId,
        isAvailable : false
      });
    },

    loadTagList : function* () {
      // sometimes the groupCar is loaded by the name resolution depth is not.
      if(!this.groupCar || (this.groupCar.length && !this.groupCar[0].groupRole)) {
        let GroupCar = Bento.model('GroupCar');
        this.groupCar = yield GroupCar.find({
          where: { carId: this.id },
          include: [
            {
              model: 'GroupRole',
              as: 'group_role'
            }
          ]
        });
      }
      return this.groupCar;
    },

    getTag : function *(tag) {
      let tagList = yield this.loadTagList();
      var res = tagList.filter((row) => {
        if(row.groupRole) {
          return row.groupRole.name === tag;
        } else {
          console.log("Can't find tag for car", this.id, tagList);
        }
      });
      return res;
    },

    addTag : function *(tag) {
      let record = yield this.hasTag(tag);
      if(record) {
        return record;
      }
      let GroupRole = Bento.model('GroupRole');
      let groupRecord = yield GroupRole.findOne({where: {name: tag}});
      if(groupRecord) {
        let GroupCar = Bento.model('GroupCar');
        let tag = new GroupCar({
          carId: this.id,
          groupRoleId: groupRecord.id
        });
        yield tag.save();
      }    
    },

    isTagged : function *(tag) {
      return (yield this.getTag(tag)).length;
    },

    hasTag : function *(tag) {
      return (yield this.getTag(tag)).length;
    },

    untag : function *(tag) {
      let record = yield this.getTag(tag);
      if(record.length) {
        let GroupCar = Bento.model('GroupCar');
        yield GroupCar.destroy({where: {id: record[0].id} });
      }
    },

    delTag : function *(tag) {
      return yield this.untag(tag);
    },

    removeDriver : function *() {
      yield this.update({
        userId : null
      });
    }

  };

  model.attributes = [
    'bookingId',
    'lastBooking',
    'statuscolumn',
    'lastAction',
    'lastActionTime',
    'user'
  ];

  model.relations = [
    'User',
    'Booking',
    'GroupCar',
    function(User, Booking, GroupCar) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
      this.hasMany(Booking, { as : 'booking' });
      this.hasMany(GroupCar,  { as : 'groupCar', foreignKey : 'carId' });
    }
  ];

  return model;

});
