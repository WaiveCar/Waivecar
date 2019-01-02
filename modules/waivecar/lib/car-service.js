'use strict';

let sequelize = Bento.provider('sequelize');
let co          = require('co');
let parallel    = require('co-parallel');
let request     = require('co-request');
let moment      = require('moment');
let notify      = require('./notification-service');
let Service     = require('./classes/service');
let LogService  = require('./log-service');
let UserLog     = require('../../log/lib/log-service');
let redis       = require('./redis-service');
let Actions     = LogService.getActions();
let queue       = Bento.provider('queue');
let queryParser = Bento.provider('sequelize/helpers').query;
let changeCase  = Bento.Helpers.Case;
let access      = Bento.Access;
let error       = Bento.Error;
let relay       = Bento.Relay;
let log         = Bento.Log;
let config      = Bento.config.waivecar;
let hooks       = Bento.Hooks;

let User = Bento.model('User');
let Car  = Bento.model('Car');
let Booking = Bento.model('Booking');
let BookingDetails = Bento.model('BookingDetails');
let ParkingDetails = Bento.model('ParkingDetails');
let GroupCar  = Bento.model('GroupCar');
const util = require('util')

let geolib      = require('geolib');
let fs          = require('fs');
let _         = require('lodash')

let carMap = false;

function legacyWorkAround(car) {
  car.plateNumberWork = car.plateNumber;
  delete car.plateNumber;
}

module.exports = {

  // Track api errors to notify admins
  _errors : {},

  *shouldRelay(car) {
    var hour = (new Date()).getHours();
    if(hour >= 4 && hour < 8) {
      if(car) {
        return yield car.hasTag('level');
      } 
      return false;
    }
    return true;
  },

  // people only really care about licenses ... so this 
  // helps convert things over in some non-braindead way.
  *id2license(id) {
    // we *cache* things
    if(!carMap) {
      carMap = {};
      (yield Car.find()).forEach((car) => {
        // create a two way map
        carMap[car.id] = car.license;
        carMap[car.license] = car.id;
      });
    }
    if(!arguments.length) { 
      return carMap;
    }
    return carMap[id];
  },

  *index(query, _user) {
    var hour = moment().tz('America/Los_Angeles').format('H');
    var isAdmin = _user && _user.hasAccess('admin');
    let cars;

    var opts = {
      include: [{
        model: 'GroupCar',
        as: 'tagList',
      }],
      where : {
        inRepair: false,
        adminOnly: false
        //
        // This gets put in the list
        // if the user is not an admin.
        // Otherwise, the admin should be
        // able to see unavailable cars in 
        // the app.
        //
        // isAvailable: true,
      }
    };

    if (!isAdmin) {
      opts.where.isAvailable = true;
    } else {
      opts.where.userId = null;
    }

    // Don't show la cars between 1 and 5am pacific time.
    // Unless you are an admin
    if((hour >= 22 || hour < 1) && !isAdmin) {
      let $where = opts.where;
      opts.where = {
        $and: [ 
          { 
            $or: [ 
              { charge: { $lt : 50 } }, 
              { charge: { $gt : 58 } }
            ]
          },
          $where 
        ]
      };
    } else if((hour >= 1 && hour < 4) && !isAdmin) {
      opts.where = { 
        $or : [
          sequelize.literal("is_available = true and tagList.group_role_id = 7"), { 
            inRepair: false,
            adminOnly: false,
            isAvailable: true,
            charge: {
              $or: [
                { $lt : 35 },
                { $gt : 58 }
              ]
            }
          }, 
        ]
      };
    }

    if(_user) {
      if(!isAdmin) {
        //console.log(util.inspect(cars, false, null));
        let matchSet = yield _user.getTagList('region', 'id');

        
        // for legacy reasons, some users aren't marked as la, which is '6' numerically
        if(matchSet.length === 0) {
          matchSet = [6];
        }

        opts.include[0].where = {
          groupRoleId: { $in: matchSet }
        };
      }

      let $where = opts.where;
      opts.where = {
        $or: [
          { userId: _user.id },
          $where
        ]
      };
    }

    // This special endpoint gets all the cars without much ado.
    if(query.type === 'all') {
      opts = {};
    }

    if(query.type === 'parking') {
      opts.where = {
        inRepair: false,
        adminOnly: false,
        bookingId: null,
        license: { $notLike: '%work%' }
      };
      
      opts.include = [{
        model: sequelize.models.GroupCar,
        as: 'tagList',
      }, {
        model: sequelize.models.Booking,
        as: 'bookings',
        required: false,
        limit: 1,
        where: {
          status: { $in: ['completed', 'ended'] }
        },
        order: [['created_at','desc']],
        include: [{
          required: false,
          model : sequelize.models.BookingDetails,
          as    : 'details',
          where: {
            type: 'end'
          }
        },{
          model: sequelize.models.ParkingDetails,
          required: false,
          as    : 'parkingDetails'
        }],
      }];

      cars = yield Car._schema.findAll(opts);
    } else {
      cars = yield Car.find(opts);

      // console.log(util.inspect(opts, false, null));

      if(_user) {
        let available = 0;
        cars.forEach(function(car) {
          car.license = car.license || '';

          // we want a single reference for this number
          // and not have it be computed in various places
          car.range = car.milesAvailable(); 

          available += car.isAvailable;

          // We toggle the car to be "available" for the admin so
          // that it will show up on the list of cars. This helps
          // fleet pick up low cars at night from the app in an 
          // easy way.
          car.isReallyAvailable = car.isAvailable;
          if(isAdmin) {
            car.isAvailable = true;
          }

          legacyWorkAround(car);
        });

        fs.appendFile('/var/log/outgoing/carsrequest.txt', JSON.stringify([new Date(), available, _user.id, _user.latitude, _user.longitude]) + '\n',function(){});
      }
    }

    return cars;
  },

  *stats() {
    let allCars = yield Car.find();
    let count = allCars.reduce((acc, car) => car.inRepair ? acc + 1 : acc, 0);
    return {
      carsOutOfService: count,
      percentOutOfService: (count / allCars.length) * 100,
    };
  },

  joinCarsWithBookings(cars, bookings) {

    var cardIdToBookingIdMap = {};

    bookings.forEach(function(booking) {
      cardIdToBookingIdMap[booking.carId] = booking.id;
    });

    cars.forEach(function(car) {
      var bookingId = cardIdToBookingIdMap[car.id];
      if (bookingId) {
        car.bookingId = bookingId;
      }
    });

  },

  *bookings(query, id, _user) {
    let opts = {
      where: { carId: id },
      order: [ ['created_at', 'desc'] ],
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        }
      ],
      limit: parseInt(query.limit, 10) || 20
    }
    if(query.status) {
      opts.where.status = { $in: query.status.split(',') };
    }
    return yield Booking.find(opts);
  },

  *carsWithBookings(_user) {
    let start = new Date();
    let perf = [];
    let cars = [];

    function *join_method() {
      perf.push('table join');

      // See #1077. Super Admin can access all cars.
      // But still we need car's group on UI
      cars = yield Car.find({
        include: [
          {
            model: 'GroupCar',
            as :'tagList'
          },
          { 
            model : 'User',
            as: 'user'
          },
          { 
            model : 'Booking',
            as: 'currentBooking'
          }
        ]
      });
      perf.push("car " + (new Date() - start));
    }

    function *separate_method() {
      perf.push('separate');

      // See #1077. Super Admin can access all cars.
      // But still we need car's group on UI
      let allCars = yield Car.find();
      perf.push("cars " + (new Date() - start));

      let carsOfInterest = allCars.filter((row) => row.bookingId);

      let bookingIdList = carsOfInterest.map((row) => row.bookingId);
      let userIdList = carsOfInterest.map((row) => row.userId);
      let carIdList = allCars.map((row) => row.id);

      let bookingList = yield Booking.find({where: { id: { $in: bookingIdList } } });
      perf.push("bookings " + (new Date() - start));
      let userList = yield User.find({where: { id: { $in: userIdList } } });
      perf.push("users " + (new Date() - start));
      let groupList = yield GroupCar.find({where: { carId: { $in: carIdList } } });
      perf.push("groups " + (new Date() - start));

      let carMap = {};
      let userMap = {};

      allCars.forEach((row) => { 
        carMap[row.id] = row; 
        // there will be multipls groupCars ... see below.
        carMap[row.id].tagList = [];
      });
      userList.forEach((row) => { userMap[row.id] = row; });

      groupList.forEach((row) => { carMap[row.carId].tagList.push( row ); });
      bookingList.forEach((row) => { carMap[row.carId].currentBooking = row; });
      allCars.forEach((row) => { row.user = userMap[row.userId]; });

      cars = allCars;
      perf.push("car " + (new Date() - start));
    }

    if(Math.random() < 0.5) {
      yield join_method();
    } else {
      yield separate_method();
    }
    
    // the schema as of this writing is
    // enum('reserved','pending','cancelled','ready','started','ended','completed','closed') 
    let statusMap = {
      cancelled: 'Available',
      closed:    'Available',
      completed: 'Available',
      ended:     'Available',
      pending:   'Reserved',
      ready:     'Active',
      reserved:  'Reserved',
      started:   'Active',
    };

    let lastActionList = yield cars[0].getLastActionForAllCars();
    let lastActionMap = {};
    perf.push("action " + (new Date() - start));

    lastActionList.forEach((row) => {
      lastActionMap[row.carId] = row;
    });

    cars.forEach(function(car){
      car.lastAction = lastActionMap[car.id];
      if(car.lastAction) {
        car.lastActionTime = car.lastAction.createdAt;
      }
      car.license = car.license || '';
      if(car.currentBooking) {
        car.statuscolumn = statusMap[car.currentBooking.status] || 'Unavailable';

        if(car.statuscolumn === 'Available' && !car.isAvailable) {
          car.statuscolumn = 'Unavailable';
        }

      } else { 
        car.statuscolumn = car.isAvailable ? 'Available' : 'Unavailable';
      }

    });
    perf.push("misc " + (new Date() - start));

    //console.log(perf.join(' | '));
    return cars;
  },

  *find(query) {
    let parts = query.split(' ');

    return yield Car.find({
      where: { $or: 
        parts.map((term) => {
          return { license : { $like : `%${ term }%` } };
        })
      }
    });
  },

  // This is the do-nothing thing that is in reference
  // to https://github.com/clevertech/Waivecar/issues/577
  // There's more rationale as to the placement of this 
  // in the controller comment
  *ping() {
    return true;
  },

  *show(id, _user) {
    // there's an old bug that we are trying to access the car's
    // ble through this -- if we are hitting this bug we don't even try
    let car = null;
    if(id.length !== 'ble') {

      // See #1077
      car = yield Car.findById(id, {
        include: [
          {
            model : 'User',
            as    : 'user'
          }
        ]
      });
    }

    if(!car) {
      throw error.parse({
        code    : 'CAR_NOT_FOUND',
        message : 'Car is not found or You don\'t have access to it',
        data    : {
          id : id
        }
      }, 404);
    }
    car.tagList = yield GroupCar.find({
      where : { carId: id },

      order : [[ 'id', 'asc' ]],

      include : [ 
        {
          model: 'GroupRole',
          as: 'group_role'
        }
      ]
    });
    legacyWorkAround(car);

    return car;
  },

  *update(id, payload, _user) {
    access.verifyAdmin(_user);

    // See #1077
    let includeCarGroup = {
      model : 'GroupCar',
      as: 'tagList'
    }

    let car = yield Car.findById(id, { include: [includeCarGroup]});
    if (!car) {
      throw error.parse({
        code    : 'CAR_SERVICE_NOT_FOUND',
        message : 'The car has not been registered in our database.',
        data    : {
          id : id
        }
      }, 404);
    }
    let device = yield this.getDevice(car.id, _user, 'update');

    if (payload.tagList) {
      payload.tagList = payload.tagList.map((row) => { return row.toLowerCase(); });

      let oldTags = yield car.getTagList(['la', 'csula', 'level', 'choice', 'waivework']);      

      let toRemove = _.difference(oldTags, payload.tagList);
      for(var ix = 0; ix < toRemove.length; ix++) {
        yield car.untag(toRemove[ix]);
      }

      let AllOldTags = yield car.getTagList();
      let toAdd = _.difference(payload.tagList, AllOldTags);

      for(var ix = 0; ix < toAdd.length; ix++) {
        yield car.addTag(toAdd[ix]);
      }
      // Notifications may need to be added for changes in groupCar
    }

    yield car.update(Object.assign(device || {}, payload));
    if(yield this.shouldRelay(car)) {
      legacyWorkAround(car);
      relay.emit('cars', {
        type : 'update',
        data : car.toJSON()
      });
    }

    return car;
  },

  // If the car has no booking and a user languishing around, we should be able
  // to kick them out
  *kickUser(id, _user) {
    let model = yield Car.findById(id);
    if(model.userId) {

      if(model.bookingId) {
        let booking = yield Booking.findById(model.bookingId);
        // only kick out users if the booking is finished
        if(!booking.isFinished()) {
          return false;
        }
      }
      yield model.update({bookingId: null, userId: null});
    }

    if(yield this.shouldRelay(model)) {
      relay.emit('cars', {
        type : 'update',
        data : model.toJSON()
      });
    }
  },

  *updateAvailabilityAnonymous(id, isAvailable, _user) {
    let model = yield Car.findById(id);
    if (isAvailable) {
      if (!model.bookingId) {
        yield model.available();
      } else {
        throw error.parse({
          code    : 'CAR_IN_BOOKING',
          message : 'Cars can\'t be made available while they are in a current booking.',
        }, 400);
      }
    } else {
      yield model.unavailable();
    }

    if(yield this.shouldRelay(model)) {
      relay.emit('cars', {
        type : 'update',
        data : model.toJSON()
      });
    }

    if (_user) yield LogService.create({ carId : id, action : isAvailable ? Actions.MAKE_CAR_AVAILABLE : Actions.MAKE_CAR_UNAVAILABLE }, _user);

    return model;
  },

  *updateAvailability(id, isAvailable, _user) {
    access.verifyAdmin(_user);

    let model = yield this.updateAvailabilityAnonymous(id, isAvailable, _user);

    return model;
  },

  *updateRepair(id, payload, _user) {
    access.verifyAdmin(_user);
    let model = yield Car.findById(id);

    if(!model.inRepair) {
      if(!payload.reason && !model.inRepair) {
        throw error.parse({
          message : 'You need a reason to put something in repair'
        }, 400);
      }
      yield notify.notifyAdmins(`:face_with_head_bandage: ${ _user.link() } marked ${ model.link() } in repair for "${ payload.reason }"`, ['slack'], {channel: '#rental-alerts'});

      yield model.update({
        lastServiceAt: new Date(),
        repairReason: payload.reason,
        inRepair: !model.inRepair
      });
    } else {
      yield notify.notifyAdmins(`:male-doctor: ${ _user.link() } unmarked ${ model.link() } in repair for "${ model.repairReason }" and said it cost $${ payload.reason }`, ['slack'], {channel: '#rental-alerts'});
      yield model.update({
        lastServiceAt: null,
        repairReason: null,
        inRepair: !model.inRepair
      });
    }
    yield LogService.create({carId: id, action: model.inRepair ? 'REPAIR_START' : 'REPAIR_END'}, _user);

    // we trick the relay into hiding cars that are set
    // to repair for legacy versions of the app so that
    // they don't magically appear.
    var obj = model.toJSON();
    if(model.inRepair) {
      obj.isAvailable = false;
    }

    relay.emit('cars', {
      type : 'update',
      data : obj
    });

    return model;
  },

  *updateTotalLoss(id, _user) {
    access.verifyAdmin(_user);
    let model = yield Car.findById(id);

    if( !model.isTotalLoss) {
      yield notify.notifyAdmins(`:boom: ${ _user.link() } marked ${ model.link() } as a total loss.`, ['slack'], {channel: '#rental-alerts'});
    } else {
      yield notify.notifyAdmins(`:shrug: ${ _user.link() } decided ${ model.link() } isn't that bad after all and unmarked it as a total loss.`, ['slack'], {channel: '#rental-alerts'});
    }
    yield model.update({isTotalLoss: !model.isTotalLoss});
    if (model.isTotalLoss && !model.inRepair) {
      yield model.update({
        inRepair: true,
        isAvailable: false,
      });
    }
    var obj = model.toJSON();
    if(model.isTotalLoss) {
      obj.isAvailable = false;
    }

    relay.emit('cars', {
      type : 'update',
      data : obj
    });

    return model;
  },

  *updateVisibility(id, isVisible, _user) {
    access.verifyAdmin(_user);
    let model = yield Car.findById(id);

    if (isVisible) {
      yield model.visible();
    } else {
      yield model.hidden();
    }

    relay.emit('cars', {
      type : 'update',
      data : model.toJSON()
    });

    return model;
  },

  *refresh(deviceId) {
    // sometimes this will throw an error and cause issues with the booking ending
    try { 
      let updatedCar = yield this.getDevice(deviceId, null, 'refresh');
      if (updatedCar) {
        //log.debug(`Cars : Refresh : updating ${ deviceId }.`);
        yield this.syncUpdate(deviceId, updatedCar);
      } else {
        log.debug(`Cars : Refresh : failed to retrieve ${ deviceId } to update database.`);
      }
    } catch(ex) { }
    let res = yield Car.findById(deviceId);

    // The current app (2018-06-15) uses an "incorrect" check to see if the doors are closed.
    // This little thing here is to hopefully make it so that the legacy apps can end their
    // rides better.
    res.isDoorsClosed = !res.isDoorOpen;

    return res;
  },

  *closest(long, lat) {
    let all = (yield Car.find()).map((row) => {
      let obj = Object.assign({}, row);
      obj.distance = geolib.getDistance({longitude: long, latitude: lat}, row);
      return obj;
    });
    let radius = 50;
    let nearest = [];

    for(; radius < 1000; radius+=20 ) {
      nearest = all.filter((row) => {
        return row.distance < radius;
      });
      if(nearest.length > 1) {
        break;
      }
    }

    return {distance: radius, res: nearest};
  },

  /**
   * A convenience method to update the local Car (to enable pre-save model transformations)
   * @param  {Number} id          car Id
   * @param  {Object} data        update data to persist
   * @param  {Object} existingCar existing Car to update (optional)
   * @param  {Object} _user       user (optional)
   * @return {Object}             updated Car
   */
  *syncUpdate(id, data, existingCar, _user) {
    let user = false;
    if (!existingCar) {
      existingCar = yield Car.findById(id);
    }

    if (!existingCar.license) {
      let meta = config.car.meta[existingCar.id];
      if (meta) {
        data.license = meta.license;
      }
    }

    if (data.currentSpeed === 0) {
      if (existingCar.distanceSinceLastRead === 0) {
        delete data.positionUpdatedAt;
      }
      data.isParked = (data.currentSpeed === 0) && (!data.isIgnitionOn);
    }

    // We only store the charges if things are non-zero 
    // (see https://github.com/clevertech/Waivecar/issues/629)
    //
    // And by zero we are also considering all bottom values, as one
    // user got some other non-integer bottom values.
    if (data.charge) {
      // see https://github.com/WaiveCar/Waivecar/issues/727 ... Waive2 and 20 is off by 35 
      if (['WAIVE20', 'WAIVE2'].indexOf(existingCar.license) !== -1) {
        // we lob off some amount
        data.charge -= 30;
        // and make sure it's over 0.
        data.charge = Math.max(0, data.charge);
      }

      // We notify fleet if the car passes a threshold to make
      // sure that they put the car out.
      // see https://github.com/WaiveCar/Waivecar/issues/857
      //
      // Also we want to prevent things from being hit multiple times. Normally we can do average charge
      // and flags, but this won't work here because we have the classic flag clearing problem since car 
      // rows are persistent and reused and I'm not going to make a mark and sweep system for this stupid 
      // thing.  So instead we are going to make the lock something like 5 minutes ... that should make
      // things shut up
      //
      if (data.isCharging && !existingCar.isAvailable && (yield redis.shouldProcess('car-charge-notice', existingCar.id, 5 * 60 * 1000))) {
        if (
            (data.charge >= 100 && existingCar.charge < 100) ||
            (data.charge >= 80 && existingCar.charge < 80)
        ) {
          let secondHalf = '';
          if(existingCar.userId) {
            if(!user) {
              user = yield User.findById(existingCar.userId);
            }
            secondHalf = `by ${user.link()}!`;
          } else {
            secondHalf = 'and should be made available.';
          }
          yield notify.notifyAdmins(`:car: ${ existingCar.link() } has charged to ${ data.charge }% ${ secondHalf }`, ['slack'], {channel: '#rental-alerts'});
        }
      }

      ///car log to base
      existingCar.addToHistory(data.charge);
      data.chargeHistory = existingCar.chargeHistory;
    }

    if (data.boardVoltage < 10.5) {
      let message = `:skull: ${ existingCar.link() } board voltage is at ${ data.boardVoltage }v`;
      if (existingCar.userId) {
        if(!user) {
          user = yield User.findById(existingCar.userId);
        }
        message += ` (Current user is ${ user.link() })`;
      }
      // show them only 1/20 times
      if(Math.random() < 0.05) {
        yield notify.notifyAdmins(message, [ 'slack' ], { channel : '#rental-alerts' });
      }
    }
    // We find out if our charging status has changed
    if (('charging' in data) && (data.isCharging != existingCar.isCharging)) {
      yield UserLog.addUserEvent(_user, data.isCharging ? Actions.START_CHARGE : Actions.END_CHARGE, id, data.charge);
      yield LogService.create({carId: id, action: data.isCharging ? Actions.START_CHARGE : Actions.END_CHARGE});

      // see #616 - we are tracking when a car was last charged with respect to
      // the odometer.
      if(!data.isCharging) {
        data.mileageLastCharge = data.totalMileage;
      }
    }

    yield existingCar.update(data);

    if(existingCar.userId) {
      legacyWorkAround(existingCar);
      relay.user(existingCar.userId, 'cars', {
        type: 'update',
        data: existingCar.toJSON()
      });
    }

    return existingCar;
  },

  // Does sync operations against all cars in the invers fleet.
  *syncCars() {
    //log.debug('CarService : syncCars : start');
    let refreshAfter = config.car.staleLimit || 15;

    // Retrieve all local cars.

    let allCars = yield Car.find();

    // Filter cars to include either:
    // 1. car is currently in a booking (i.e. not available), or
    // 2. car has never been updated, or
    // 3. car has not been updated for more than [refreshAfter] minutes.

    let stale = moment().subtract(refreshAfter, 'minutes');
    let cars  = allCars.filter((c) => {
      return !c.isAvailable || !c.updatedAt || moment(c.updatedAt).isBefore(stale);
    });

    // If cars exist but no updates are required, return

    if (allCars.length > 8 && cars.length === 0) {
      log.debug('Cars : Sync : No cars to be synced.');
      return;
    }

    // Retrieve all Active Devices from Invers and loop.
    //log.debug(`Cars : Sync : retrieving device list from Cloudboxx.`);
    let devices = yield this.getAllDevices();
    //log.debug(`Cars : Sync : ${ devices.length } devices available for sync.`);

    let syncList = devices.map(device => this.syncCar(device, cars, allCars));
    let result   = yield parallel(syncList);

    return yield Car.find();
  },

  // Note that the carList and the allCars are not model links
  // but actual arrays of results. SMH
  *syncCar(device, carList, allCars) {
    try {
      let existingCar = carList.find(c => c.id === device.id);
      if (existingCar) {
        let updatedCar = yield this.getDevice(device.id, null, 'sync');
        if (updatedCar) {
          // log.debug(`Cars : Sync : updating ${ device.id }.`);
          yield this.syncUpdate(existingCar.id, updatedCar, existingCar);
        } else {
          log.debug(`Cars : Sync : failed to retrieve ${ device.id } to update database.`);
        }
      } else {
        // If Device does not match any Car then add it to the database.
        let excludedCar = allCars.find(c => c.id === device.id);
        if (!excludedCar) {
          let newCar = yield this.getDevice(device.id);
          if (newCar) {
            let car = new Car(newCar);
            let meta = config.car.meta[car.id];
            if (meta) {
              car.license = meta.license;
            } else {
              let nextNumber = (yield Car.find()).length; 
              let candidateName = '';
              do {
                candidateName = `newCar${ nextNumber }`;
                existingCar = yield Car.findOne({ where : { license: candidateName } });
                nextNumber ++;
              } while(existingCar);

              car.license = candidateName;
            }
            car.licenseUsed = car.license;
            log.debug(`Cars : Sync : adding ${ device.id }.`);
            car = yield car.upsert();
            yield car.addTag('la');
          } else {
            log.debug(`Cars : Sync : failed to retrieve ${ device.id } to add to database.`);
          }
        } else {
          // If Device was found in database but not in our filtered list, ignore.
          log.debug(`Cars : Sync : skipping ${ device.id }.`);
        }
      }
    } catch(err) {
      if(err.data) {
        log.warn(`Cars : Sync : ${ err.data.status } : ${ err.data.resource }`);
      } else {
        log.warn(`Cars : Sync : ${ err }`);
      }
    }
  },

  *getAllDevices() {
    var deviceList = [];
    var partial;
    let offset = 0;
    let total = 0;

    do {
      partial = yield this.request('/devices?active=true&limit=100&offset=' + offset);
      total = partial.count || partial.data.length;
      if(!partial.data || !partial.data.length) {
        break;
      }
      deviceList = deviceList.concat(partial.data);
      offset = deviceList.length;
    } while(offset < total);

    if(deviceList.length) {
      return deviceList;
    }
    return null;
  },

  logStatus(status, id, misc) {
    status.id = id;
    status.t = new Date();
    status._misc = misc;
    fs.appendFile('/var/log/invers/log.txt', JSON.stringify(status) + "\n", function(){});
  },

  *getDevice(id, _user, source) {
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }
    try {
      let status = yield this.request(`/devices/${ id }/status`, { timeout : 30000 });
      this._errors[id] = 0;
      if (status) {
        this.logStatus(status, id, source);
        return this.transformDeviceToCar(id, status);
      }
    } catch (err) {
      if (err.code === 'CAR_SERVICE_TIMEDOUT') {
        if (!this._errors[id]) this._errors[id] = 0;
        this._errors[id]++;
        let device = id;
        let car    = yield Car.findById(id);
        if (car) {
          device = car.license || id;
        }
        log.warn(`Cars : Sync : fetching device ${ id } failed, fleet request timed out.`);
        if (this._errors[id] === 4) {
          yield notify.notifyAdmins(`${ device } timed out on API status request from cloudboxx | ${ Bento.config.web.uri }/cars/${ device } | Contact cloudboxx to resolve.`, [ 'slack' ], { channel : '#api-errors' });
          this._errors[id] = 0;
        }
        return null;
      }
      throw err;
    }
  },

  *ble(id, _user) {
    let car = yield Car.findById(id);
    
    if(!_user.isAdmin() && (!car || car.userId !== _user.id)) {
      return error.parse({
        code    : 'CAR_SERVICE',
        message : 'You do not have access to that car'
      });
    }

    let now = new Date();
    let expire = new Date(+now + 38 * 60 * 1000);

    let status = yield this.request(`/bluetooth-token/${ id }`, {
      method : 'POST'
    }, {
      level: "Drive",
      from: now.toISOString(),
      until: expire.toISOString()
    });

    return status;
  },

  *horn(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNLOCK_CAR }, _user);
    return yield this.executeCommand(id, 'horn', 'on', _user);
  },

  // "Accessing" a car involves unlocking AND unimmobilizing, the latter which has a 
  // check and denies the user under a number of circumstances.
  *accessCar(id, _user, car) {
    car = car || (yield Car.findById(id));
    let res;
    try {
      res = yield this.unlockCar(id, _user, car);
    } catch(ex) {
      res = ex;
    }

    if(car.isImmobilized && (_user.hasAccess('admin') || car.userId === _user.id)) {

      if(car.userId === _user.id) {
        let booking = yield _user.currentBooking();
        if(booking.status === 'reserved') {
          let BookingService = require('./booking-service');
          yield BookingService.ready(booking.id, _user);
        }
      }

      try {
        res = yield this.unlockImmobilizer(id, _user, car, 'access');
      } catch(ex) {
        res = ex;
      }
    }
    return res;
  },

  *unlockCar(id, _user, car, opts) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNLOCK_CAR }, _user);
    return yield this.executeCommand(id, 'central_lock', 'unlock', _user, car, opts);
  },

  *lockCar(id, _user, car, opts) {
    if (_user) yield LogService.create({ carId : id, action : Actions.LOCK_CAR }, _user);
    let res = yield this.executeCommand(id, 'central_lock', 'lock', _user, car, opts);

    let bookingService = require('./booking-service');
    car = car || (yield Car.findById(id));
    let isInSantaMonica = yield bookingService.getZone(car, 'Santa Monica');
    if(isInSantaMonica) {
      let actionService = require('./action-service');
      let shouldWarn = yield actionService.getAction('tagWarnLockCar', _user.id, _user);
      if(shouldWarn.action) {
        yield actionService.goForward('tagWarnLockCar', _user.id);
        throw error.parse({
          code    : 'TAG_WARNING',
          message : 'As of January 1, 2019, parking meters are <b>No Longer Free</b> in the City of Santa Monica. If this changes in the future, we will notify you. We will remind you of this the first few times when you lock the car in the Santa Monica.'
        }, 400);
      }
    }
  },

  *openDoor(id, _user){
    if (_user) yield LogService.create({ carId : id, action : Actions.OPEN_DOOR_CAR }, _user);
    let car = yield Car.findById(id);
    return yield car.openDoor();
  },

  *closeDoor(id, _user){
    if (_user) yield LogService.create({ carId : id, action : Actions.CLOSE_DOOR_CAR }, _user);
    let car = yield Car.findById(id);
    return yield car.closeDoor();
  },

  *retrieve(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.RETRIEVE }, _user);
    yield this.executeCommand(id, 'central_lock', 'unlock', _user);
    yield this.executeCommand(id, 'immobilizer', 'unlock', _user);
    let car = yield this.updateAvailabilityAnonymous(id, false, _user);
    yield notify.notifyAdmins(`:scooter: ${ _user.link() } is retrieving ${ car.license }.`, ['slack'], {channel: '#reservations'});
  },

  *instaBook(id, _user) {
    // This will allow admins to instantly book into cars and is designed to be a replacement for the "retrieve" api call
    // it creates a booking and starts it immediately.
    if (!_user.hasAccess('admin')) {
      throw error.parse({
        code    : 'NON_ADMIN_CANNOT_INSTABOOK',
        message : 'Users that are not admins cannot use instabook.',
      }, 401);
    }
    let bookingService = require('./booking-service');

    let car = yield this.updateAvailabilityAnonymous(id, true, _user);
    let booking = yield bookingService.create({
      source: 'web',
      userId: _user.id,
      carId: id,
    }, _user);
    yield booking.addFlag('instabook');
    yield bookingService.ready(booking.id, _user);

    if (_user) yield LogService.create({ carId : id, action : Actions.INSTABOOK }, _user);
    yield notify.notifyAdmins(`:scooter: ${ _user.link() } instabooked ${ car.license }.`, ['slack'], {channel: '#reservations'});
  },

  *instaEnd(id, _user) {
    let car = yield Car.findById(id);
    if (!_user.hasAccess('admin')) {
      throw error.parse({
        code    : 'NON_ADMIN_CANNOT_INSTABOOK',
        message : 'Users that are not admins cannot use instabook.',
      }, 401);
    }
    let bookingService = require('./booking-service');

    yield bookingService.end(car.bookingId, _user, {}, {}); 
    yield bookingService.complete(car.bookingId, _user, {}, {}); 

    if (_user) yield LogService.create({ carId : id, action : Actions.INSTAEND }, _user);
    car = yield this.updateAvailabilityAnonymous(id, true, _user);
    yield notify.notifyAdmins(`:scooter: ${ _user.link() } instaended ${ car.license }.`, ['slack'], {channel: '#reservations'});
  },

  *rentable(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.RENTABLE }, _user);
    yield this.executeCommand(id, 'central_lock', 'lock', _user);
    yield this.executeCommand(id, 'immobilizer', 'lock', _user);
    let car = yield this.updateAvailabilityAnonymous(id, true, _user);
    yield notify.notifyAdmins(`:motor_scooter: ${ _user.link() } made ${ car.license } rentable.`, ['slack'], {channel: '#reservations'});
  },

  *unlockImmobilizer(id, _user, car, fromWhere) {
    if(!car || !car.currentBooking) {
      car = yield Car.findById(id, {
        include : [{
            model : 'Booking',
            as    : 'currentBooking'
          },
        ]
      });
    }

    let immobilized = car.currentBooking && car.currentBooking.isFlagged('immobilized');

    // If the admin is unimmobilizing it then we can unflag it as such under a number
    // of conditions.
    if (_user.hasAccess('admin')) {

      // This means that we are being called from the accessCar wrapper which
      // has replaced the unlock command to address #1438 ... this is 
      // potentially ok if the admin is using the service as a user, but we need
      // to check that 
      if(fromWhere === 'access') {

        if(car.userId != _user.id) {
          // This means that the admin called a legacy unlock command from somewhere
          // in the backend that we haven't updated or caught. What we meant to do
          // in this case is the legacy functionality, that is, only unlock the doors.
          //yield notify.tellChris(`${ _user.name() } ${_user.id} tried to unimmobilize ${ car.license } from a legacy unlock`);
          return false;
        }
        // Otherwise the user is likely using the service and we should treat them like
        // a normal user and proceed.
      } else if(immobilized) {
        yield car.currentBooking.unFlag('immobilized');
      }

      // This means the user isn't an admin and they're trying to unimmobilize somehow ... 
      // This shouldn't be possible. 
      //
      // There is yet another check at the executeCommand level btw that makes sure this
      // doesn't happen. (see #1373)
      //
    } else if(immobilized || !car.currentBooking) {
      yield notify.tellChris(`${ _user.name() } ${ _user.id } tried to unimmobilize ${ car.license }`);
      return false;
    }
      
    yield LogService.create({ carId : id, action : Actions.UNIMMOBILIZE_CAR }, _user);
    return yield this.executeCommand(id, 'immobilizer', 'unlock', _user, car);
  },

  *lockImmobilizer(id, _user) {
    if (_user.hasAccess('admin')) {
      // this is an admin immobilizing the vehicle ... 
      // the user in a booking shouldn't be able to undo this.
      let car = yield Car.findById(id, {
        include : [{
            model : 'Booking',
            as    : 'currentBooking'
          },
        ]
      });
      if(car.currentBooking && !car.currentBooking.isFlagged('immobilized')) {
        yield car.currentBooking.addFlag('immobilized');
      }
    }

    yield LogService.create({ carId : id, action : Actions.IMMOBILIZE_CAR }, _user);
    return yield this.executeCommand(id, 'immobilizer', 'lock', _user);
  },

  *lockAndImmobilize(id, _user) {
    let existingCar = yield Car.findById(id);
    if (!existingCar) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }

    let payload = changeCase.toSnake({
      centralLock : 'locked',
      immobilizer : 'locked'
    });
    let status = yield this.request(`/devices/${ id }/status`, {
      method : 'PATCH'
    }, payload);
    let updatedCar = this.transformDeviceToCar(id, status);
    if (_user) yield LogService.create({ carId : id, action : Actions.IMMOBILIZE_CAR }, _user);
    if (_user) yield LogService.create({ carId : id, action : Actions.LOCK_CAR }, _user);
    return yield this.syncUpdate(id, updatedCar, existingCar, _user);
  },

  /**
   * Execute a Command against a Device and update Car
   * @param  {String} id
   * @param  {String} part    central_lock || immobilizer
   * @param  {String} command lock || unlock
   * @param  {Object} _user
   * @return {Object} updated Car
   */
  *executeCommand(id, part, command, _user, existingCar, opts) {
    opts = opts || {};
    existingCar = existingCar || (yield Car.findById(id));

    if(!id || !existingCar) {
      throw error.parse({
        code    : 'IGNITION_ON',
        message : "That didn't work. Are you sure you are in a booking?"
      }, 400);
    }

    // #1373: We need to make sure the user has access to do this to the car.
    // If it doesn't look like they do then we give a valid response as if
    // the action happened, thus failing silently as far as they are concerned.
    //
    // We then send an alert to slack telling us of the issue.  It's more than
    // likely a programming flaw on our part instead of a malicious hacker.
    if(!opts.overrideAdminCheck &&
        _user && 
        (!_user.hasAccess('admin') && existingCar.userId !== _user.id)) {
      yield notify.notifyAdmins(`:sparkle: ${ _user.link() } was denied the privilege to ${ command } ${ existingCar.link() } because we don't believe they're in a booking.`, ['slack'], {channel: '#rental-alerts'});
      return existingCar;
    }

    let updatedCar = false;
    if (!existingCar) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }
    let payload    = {};
    payload[part]  = `${ command }ed`;
    //
    // We only touch cars if we are in production. See
    // https://github.com/WaiveCar/Waivecar/issues/739
    //
    if (process.env.NODE_ENV === 'production') {
      let status     = yield this.request(`/devices/${ id }/status`, {
        method : 'PATCH'
      }, payload);
      this.logStatus(status, id, payload);
      updatedCar = this.transformDeviceToCar(id, status);
    } else {
      updatedCar = existingCar;
      if(part === 'central_lock') {
        if(command === 'unlock') { updatedCar.isLocked = false; }
        if(command === 'lock')   { 
          if (updatedCar.isIgnitionOn) {
            throw error.parse({
              code    : 'IGNITION_ON',
              message : 'The car may not have locked if the ignition is on.'
            }, 400);
          }
          updatedCar.isLocked = true; 
        }
      }
      if(part === 'immobilizer') {
        if(command === 'unlock') { updatedCar.isImmobilized = false; }
        if(command === 'lock')   { updatedCar.isImmobilized = true; }
      }
    }
    let res = yield this.syncUpdate(id, updatedCar, existingCar, _user);

    if (command == 'lock' && updatedCar.ignition === 'on') {
      throw error.parse({
        code    : 'IGNITION_ON',
        message : 'The car may not have locked if the ignition is on.'
      }, 400);
    }
    return res;
  },

  *getEvents(id, _user) {
    let events = yield this.request(`/events?device=${ id }&timeout=0`);
    return events.data;
  },

  /**
   * Helper Function to transform an Invers Car object in to a Waivecar Car
   * @param  {String} id
   * @param  {Object} data Invers car object
   * @return {Object}      WaiveCar car model
   */
  transformDeviceToCar(id, data) {

    // if we don't have a fuel level, we default to 89 ... this should
    // be eventually removed 
    if (! ('fuel_level' in data) ) {
      data['fuel_level'] = 89;
    }
    if (! ('keyfob' in data) ) {
      data['keyfob'] = 'in';
    }

    let car = {
      id                            : id,
      lockLastCommand               : data['central_lock_last_command'],
      isKeySecure                   : this.convertToBoolean(data, 'keyfob', { in : true, out : false }),
      bluetooth                     : data['bluetooth_connection'],
      alarmInput                    : data['alarm_input'],
      mileageSinceImmobilizerUnlock : data['mileage_since_immobilizer_unlock'],
      totalMileage                  : data['mileage'],
      boardVoltage                  : data['board_voltage'],
      charge                        : data['fuel_level'],
      isIgnitionOn                  : this.convertToBoolean(data, 'ignition', { on : true, off : false }),
      currentSpeed                  : data['speed'],
      isImmobilized                 : this.convertToBoolean(data, 'immobilizer', { locked : true, unlocked : false }),
      isLocked                      : this.convertToBoolean(data, 'central_lock', { locked : true, unlocked : false }),
      isDoorOpen                    : this.convertToBoolean(data, 'doors', { open : true, closed : false }),
    };

    if (data['rfid_tag_states']) {
      let cards = data['rfid_tag_states'];
      car.isChargeCardSecure = this.convertToBoolean(cards, '1', { in : true, out : false });
    }

    if (data['position']) {
      let position = data['position'];
      if (position['lat']) {
        car.latitude  = position['lat'];
        car.longitude = position['lon'];
        car.hdop = position['hdop'];
        car.distanceSinceLastRead = position['meters_driven_since_last_fix'];
        car.locationQuality       = position['quality'];
        car.calculatedSpeed       = position['speed_over_ground'];
        car.positionUpdatedAt     = position['timestamp'];
      }
    }

    if (data['electric_vehicle_state']) {
      let elec = data['electric_vehicle_state'];
      car.isCharging        = this.convertToBoolean(elec, 'charge', { on : true, off : false });
      car.isQuickCharging   = this.convertToBoolean(elec, 'quick_charge', { on : true, off : false });
      car.isOnChargeAdapter = this.convertToBoolean(elec, 'charge_adapter', { in : true, out : false });
      car.range             = elec['cruising_range'];
    }

    car.updatedAt = new Date();

    return car;
  },

  convertToBoolean(data, field, test) {
    let fieldValue = data[field];
    if (Object.keys(test).indexOf(fieldValue) > -1) {
      return test[fieldValue];
    } else {
      return false;
    }
  },

  // Returns the Response from a Request aginst the Invers API
  *request(resource, options, data) {
    options = options || {};

    // ### Request Payload

    let payload = {
      url     : config.invers.uri + resource,
      method  : options.method || 'GET',
      headers : config.invers.headers,
      timeout : options.timeout || 60000
    };
    if (data) {
      payload.body = JSON.stringify(data);
    }

    try {
      let res = yield request(payload);
      if (res.statusCode !== 200) {
        //console.log(payload, res.body);
        throw error.parse({
          code    : 'CAR_SERVICE',
          message : "The server can't contact the car, please try again.",
          data    : {
            status   : res.statusCode,
            message  : res.body,
            resource : resource
          }
        }, 400);
      }
      // This error is thrown here because this response body will say the car has locked even though
      // the lock command will not work if the ignition is on
      let json = JSON.parse(res.body);
      return JSON.parse(res.body);
    } catch (err) {
      if (err.message === 'ETIMEDOUT') {
        throw error.parse({
          code    : 'CAR_SERVICE_TIMEDOUT',
          message : "The server can't contact the car, please try again.",
          data    : {
            target : resource
          }
        }, 400);
      }
      throw err;
    }
  }
};
