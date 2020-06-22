'use strict';

let car   = require('../lib/car-service');
let error = Bento.Error;

Bento.Register.Controller('CarsController', function(controller) {

  controller.index = function *() {
    return yield car.index(this.query, this.auth.user);
  };

  controller.unassignedTelems = function *() {
    return yield car.unassignedTelems();
  };

  controller.stats = function *() {
    return yield car.stats(this.auth.user);
  };

  controller.carsWithBookings = function *() {
    return yield car.carsWithBookings(this.auth.user, this.query);
  };

  controller.bookings = function *(id) {
    return yield car.bookings(this.query, id, this.auth.user);
  };

  controller.show = function *(id) {
    return yield car.show(id, this.auth.user);
  };

  controller.update = function *(id) {
    return yield car.update(id, this.payload, this.auth.user);
  };

  // This is the retrieve/rentable utility that can be
  // installed on the fleet's phones.
  controller.magic = function *(command) {
    let Car = Bento.model('Car');
    let close = yield car.closest(this.query.longitude, this.query.latitude);
    let carList = close.res;
    let all = yield Car.find();

    return { 
      candidates: carList,
      all: all,
      distance: close.distance
    };
  };

  controller.batch = function *(command) {
    let failures = [];
    for (let car of this.payload.carList) {
      try {
        yield controller.command(car.id, command, this.auth.user);
      } catch(e) {
        failures.push(car);
      }
    }
    return {failures};
  };

  controller.command = function *(id, command, _user) {
    if (!this.auth) {
      this.auth = {user: _user};
    }
    switch (command) {
      case 'ble'                : return yield car.ble(id, this.auth.user);
      case 'lock'               : return yield car.lockCar(id, this.auth.user);
      case 'horn'               : return yield car.horn(id, this.auth.user);
      case 'lock-immobilizer'   : return yield car.lockImmobilizer(id, this.auth.user);
      case 'unlock-immobilizer' : return yield car.unlockImmobilizer(id, this.auth.user);
      case 'super-immobilize'   : return yield car.superImmobilize(id, this.auth.user);
      case 'super-unimmobilize' : return yield car.superUnimmobilize(id, this.auth.user);
      case 'refresh'            : return yield car.refresh(id, this.auth.user);
      case 'available'          : return yield car.updateAvailability(id, true, this.auth.user);
      case 'unavailable'        : return yield car.updateAvailability(id, false, this.auth.user);
      case 'repair'             : return yield car.updateRepair(id, this.payload, this.auth.user);
      case 'visible'            : return yield car.updateVisibility(id, true, this.auth.user);
      case 'hidden'             : return yield car.updateVisibility(id, false, this.auth.user);
      case 'kick'               : return yield car.kickUser(id, this.auth.user);                                
      case 'retrieve'           : return yield car.retrieve(id, this.auth.user);
      case 'instabook'          : return yield car.instaBook(id, this.auth.user);
      case 'instaend'           : return yield car.instaEnd(id, this.auth.user);
      case 'rentable'           : return yield car.rentable(id, this.auth.user);
      
      //
      // This one is a bit tricky.  For backwards compatibility we are keeping the
      // verb unlock for now (2018-10-26) although it actually means
      //
      // unlock the doors AND immobilizer.
      //
      // This is from #1438, because we only attempted unimmobilizing once.
      //
      case 'unlock'             : return yield car.accessCar(id, this.auth.user);

      //
      // In the future, "unlock" will be deprecated in favor of the verb "access"
      // There are extra checks for non-admin unimmobilizes
      //
      case 'access'             : return yield car.accessCar(id, this.auth.user);

      //
      // The classic unlock meaning just unlock is now known as "unlock-doors",
      // which has been updated in the appropriate web back-ends (878ff666)
      //
      
      case 'unlock-doors'       : return yield car.unlockCar(id, this.auth.user);

      //
      // This is here for naming consistency, deprecates "lock" and was also implemented
      // in 878ff666.
      //
      case 'lock-doors'         : return yield car.lockCar(id, this.auth.user);

      default                   : {
        throw error.parse({
          code    : `CAR_UNRECOGNIZED_COMMAND`,
          message : `The '${command}' is not supported/recognized.`
        }, 400);
      }
    }
  };

  controller.events = function *(id) {
    return yield car.events(id, this.auth.user);
  };

  //
  // This is really to address https://github.com/clevertech/Waivecar/issues/577
  // The problem was that the server didn't crash but it wasn't servicing requests
  // like expected. The "best" way to look for that, in my opinion would be to
  // put a dummy route in the same place as everything else that doesn't do much.
  //
  // Eventually with load-balancing something like this will be put elsewhere but 
  // for now this is a fine place - especially since we are tackling a separate and 
  // distinct issue.
  //
  controller.ping = function *() {
    return yield car.ping();
  };

  controller.history = function *(id) {
    return yield car.history(id, this.query);
  }; 

  controller.search = function *(search) {
    return yield car.search(this.query);
  };

  controller.createAirtableTicket = function *() {
    return yield car.createAirtableTicket(this.payload);
  };

  controller.airtableUsers = function *() {
    return yield car.getAirtableUsers();
  };

  controller.refreshAirtable = function *() {
    return yield car.handleAirtable();
  };

  return controller;
});
