'use strict';

let apiConfig   = Bento.config.api;
let Booking = Bento.model('Booking');

let Utils = require('sequelize/lib/utils');
require('./log');
let Log = Bento.model('Log');
let File = Bento.model('File');
let moment = require('moment');

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

    bookingId : {
      type       : Sequelize.INTEGER,
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

    isTotalLoss : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false,
    },

    isOutOfService : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false,
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

    plateState : {
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
      type : Sequelize.DECIMAL(10, 2),
      defaultValue: 0
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

    repairReason : {
      type : Sequelize.STRING
    },

    lastServiceAt : {
      type : Sequelize.DATE
    },

    lastTimeAtHq : {
      type : Sequelize.DATE
    },

    comments : {
      type : Sequelize.TEXT()
    },

    airtableData: {
      type: Sequelize.TEXT(),
      default: null,
    },

    bodyGrade : {
      type : Sequelize.TEXT,
      default : null,
    },
    
    frontTireWear : {
      type : Sequelize.TEXT,
      default : null,
    },

    rearTireWear : {
      type : Sequelize.TEXT,
      default : null,
    },

    registrationFileId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'file',
        key   : 'id'
      }
    },

    inspectionFileId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'file',
        key   : 'id'
      }
    },

    videoFileId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'file',
        key   : 'id'
      }
    },
    organizationId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'organizations',
        key   : 'id'
      }
    },
  };

  model.methods = {

    //
    // This one takes some explaining. If you want the "current booking", normally what you mean is
    // the one that's going on now or just ended, even if it had been disassociated from the vehicle.  
    // If you want the "previous" booking, specified by a -1 option, then if there is no current booking
    // you want the most recent booking that ended. Which means that an argument of 0 and -1 could 
    // potentially yield the same booking if something was ended but not cleaned up right (shouldn't
    // happen but this is designed for when it does anyway)
    //
    // If you specify an offset other than zero then you certainly do not want a booking that is in progress
    // so we filter out the ones that are not in progress.
    //
    // But there's a problem here. The 0th index of the not-in-progress bookings is the previous booking,
    // it means if a user calls the function with "-1", [0] is the one they actually want.  We accomodate
    // this by knocking 1 off the argument they pass in.
    //
    // Stated another way.
    //  
    //  Calling with (0) always implicates the first one
    //       | |
    //       V |
    // A. [started,   completed, completed, ...]
    //         V       Y
    // B. [completed, completed, completed, ...]
    //      Y          |
    //      |          |
    //  Calling with (-1) implicates different orders depending
    //  on the state of the car.
    //
    getBooking: function *(offset = 0, opts = {}) {
      let searchSet = ['started', 'reserved', 'ended', 'completed', 'closed'];
      let verb = 'limit' in opts ? 'find' : 'findOne';
      // the sign on the offset is merely a convention.
      offset = Math.abs(offset);

      if('limit' in opts || offset !== 0) {
        searchSet = ['ended', 'completed', 'closed'];
        offset = Math.max(offset - 1, 0);
      } else if(this.bookingId) {
        // This means we do not want a limit (as in multiple
        // bookings) and we specified 0, which means that
        // we could be getting our current booking by id
        return yield Booking.findById(this.bookingId);
      }

      return yield Booking[verb](Object.assign(opts, { 
        where : { 
          carId : this.id,
          status : {
            $in : searchSet,
          }
        },
        order: [['created_at', 'DESC']],
        offset: offset,
      }));
    },

    getPreviousBookings: function *(count=0) {
      return yield this.getBooking(0, {limit: count});
    },

    getCurrentBooking: function *() {
      return yield this.getBooking();
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
   
    getRange: function(est) {
      let multiplier = 1.0;
      let delta = 0.04;

      if(est === 'HIGH') {
        multiplier += delta;
      } else if(est === 'LOW') {
        multiplier -= delta;
      }

      if(this.license.toLowerCase().includes('work')) {
        return 650 * multiplier;
      } else if(this.model === "Spark EV") { 
        return 70 * multiplier;
      } else if(this.model === 'Tucson') {
        return 255 * multiplier;
      } else { // IONIQ
        return 140 * multiplier;
      }
    },

    avgMilesAvailable: function (est) {
      return (Math.min(this.averageCharge(), 100) * this.getRange(est)) / 100;
    },

    milesAvailable: function (est) {
      // charge is 0-100
      return (Math.min(100, this.charge) * this.getRange(est)) / 100;
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

    unavailable : function *() {
      yield this.update({
        isAvailable : false
      });
    },

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

    addDriver : function *(userId, bookingId) {
      yield this.update({
        userId      : userId,
        isAvailable : false,
        bookingId   : bookingId
      });
    },

    loadTagList : function* () {
      // sometimes the tagList is loaded by the name resolution depth is not.
      if(!this.tagList || (this.tagList.length && !this.tagList[0].groupRole)) {
        let GroupCar = Bento.model('GroupCar');
        this.tagList = yield GroupCar.find({
          where: { carId: this.id },
          include: [
            {
              model: 'GroupRole',
              as: 'group_role'
            }
          ]
        });
      }
      return this.tagList;
    },

    getTagList : function* (filter) {

      function getTags(filter) {
        return tagList
          .filter((row) => { return filter ? row.groupRole.name.toLowerCase() === filter.toLowerCase() : true; })
          .map((row) => { return row.groupRole.name; });
      }

      let tagList = yield this.loadTagList();

      if(Array.isArray(filter)) {
        return Array.prototype.concat.apply([], filter.map(getTags));
      }

      return getTags(filter);
    },


    getTag : function *(tag) {
      return (yield this.loadTagList()).filter((row) => {
        return row.groupRole.name.toLowerCase() === tag.toLowerCase();
      });
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
        let groupCar = yield GroupCar.findById(record[0].id);
        yield groupCar.delete();
      }
    },

    delTag : function *(tag) {
      return yield this.untag(tag);
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
          groupRoleId: groupRecord.id,
          // group cars does not have a groupId
          //groupId: groupRecord.groupId
        });
        yield tag.save();
      }    
    },


    removeDriver : function *() {
      yield this.update({
        userId      : null,
        bookingId   : null
      });
    },

    waiveworkChecklist : function *() {
      let checklist = {
        'current registration': false,
        'current inspection': false,
        'front tire grade': null,
        'rear tire grade': null,
        'body grade': null,
        'charge above 75%': false,
        'waivework': false, 
        'clean inside': false, 
        'clean outside': false, 
        'has keys': false,
        'maintenance updated': false,
      };
      let registrationFile = yield File.findById(this.registrationFileId);
      if (registrationFile && moment(registrationFile.comment).diff(moment()) > 0) {
        checklist['current registration'] = true;
      }
      let inspectionFile = yield File.findById(this.inspectionFileId);
      if (inspectionFile && moment(inspectionFile.comment).diff(moment()) > 0) {
        checklist['current inspection'] = true;
      }
      if (this.frontTireWear) {
        checklist['front tire grade'] = this.frontTireWear;
      }
      if (this.rearTireWear) {
        checklist['rear tire grade'] = this.rearTireWear;
      }
      if (this.bodyGrade) {
        checklist['body grade'] = this.bodyGrade;
      }
      // The level of charge should only be checked on electrics
      if (!this.license.match(/work/gi) && this.charge >= 75) {
        checklist['charge above 75%'] = true;
      } else if (this.license.match(/work/gi)) {
        checklist['charge above 75%'] = true;  
      }
      let requiredTagsList = ['waivework', 'clean inside', 'clean outside', 'has keys', 'maintenance updated'];
      for (let tag of requiredTagsList) {
        if (yield this.hasTag(tag)) {
          checklist[tag] = true;
        }
      };
      let missingList = [];
      let requiredList = [];
      for (let key in checklist) {
        requiredList.push(key);
        if (!checklist[key]) {
          missingList.push(key);
        }
      }
      checklist.registrationExpiration = registrationFile && registrationFile.comment;
      checklist.inspectionExpiration = inspectionFile && inspectionFile.comment;
      checklist.requiredList = requiredList;
      checklist.missingList = missingList;
      checklist.completedCount = requiredList.length - missingList.length;
      return checklist;
    },
  };

  model.attributes = [
    'zone',
    'plateNumberWork',
    'statusColumn',
    'isReallyAvailable',
    'lastAction',
    'lastActionTime',
    'currentBooking',
    'parking',
    'tagList',
    'user',
    'maintenanceDueAt',
    'maintenanceDueIn',
    'organizationName',
  ];
 
  model.relations = [
    'User',
    'Booking',
    'GroupCar',
    'File',
    'Organization',
    function(User, Booking, GroupCar, File, Organization) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
      this.belongsTo(Booking, { as : 'currentBooking', foreignKey : 'bookingId' });
      this.hasMany(Booking, { as : 'bookings' });
      this.hasMany(GroupCar,  { as : 'tagList', foreignKey : 'carId' });
      this.belongsTo(File, { as : 'registrationFile', foreignKey : 'registrationFileId' });
      this.belongsTo(File, { as : 'inspectionFile', foreignKey : 'inspectionFileId' });
      this.belongsTo(File, { as : 'videoFile', foreignKey : 'videoFileId' });
      this.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });
    }
  ];

  return model;

});
