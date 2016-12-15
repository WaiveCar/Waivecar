'use strict';

let booking = require('../lib/booking-service');
let error   = Bento.Error;

Bento.Register.Controller('BookingsController', function(controller) {

  function checkVersion(obj){
    var payload = obj.payload;
    var request = obj.request;

    let minApp = 797; 
    let minMarketLink = 777; 
    let version = parseInt(payload.version, 10) || 0;

    if(payload.source !== 'web' && version < minApp) {
      var 
        iPhone = request.header['user-agent'].match(/iPhone/), 
        link = "itms-apps://itunes.apple.com/app/id1051144802";

      if(!iPhone) {
        link = ( version < minMarketLink) ? 
          'https://play.google.com/store/apps/details?id=com.waivecar.app' :
          'market://details?id=com.waivecar.app';
      } 

      throw error.parse({
        code    : `BOOKING_OLD_VERSION`,
        message : `You'll need to upgrade the WaiveCar App before booking. <a href="${ link }" target="_top">Please upgrade here</a>. Thanks.`
      }, 400);
    }
  }

  /**
   * Creates a new booking request.
   * @return {Object}
   */
  controller.create = function *() {
    checkVersion(this);
    return yield booking.create(this.payload, this.auth.user);
  };

  /**
   * Returns a list of bookings.
   * @return {Object}
   */
  controller.index = function *() {
    return yield booking.index(this.query, this.auth.user);
  };

  /**
   * Returns a single booking.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield booking.show(id, this.auth.user);
  };

  /**
   * Initiates the booking and starts the ride.
   * @param  {Number} id
   * @param  {String} action
   * @return {Object}
   */
  controller.update = function *(id, action) {
    switch (action) {
      case 'start'    : return yield booking.start(id, this.auth.user);
      case 'ready'    : return yield booking.ready(id, this.auth.user);
      case 'end'      : return yield booking.end(id, this.auth.user, this.query, this.payload);
      case 'complete' : return yield booking.complete(id, this.auth.user, this.query, this.payload);
      case 'close'    : return yield booking.close(id, this.auth.user);
      default         : {
        throw error.parse({
          code    : `BOOKING_INVALID_ACTION`,
          message : `'${ action }' is not a valid booking action.`
        }, 400);
      }
    }
  };

  /**
   * Updates all the details missing their addresses.
   * @yield {[type]} [description]
   */
  controller.patchAddressDetails = function *() {
    return yield booking.patchAddressDetails();
  };

  /**
   * Cancels a booking.
   * @param  {Number} id
   * @return {Object}
   */
  controller.cancel = function *(id) {
    return yield booking.cancel(id, this.auth.user);
  };

  return controller;

});
