'use strict';

let booking = require('../lib/booking-service');
let error   = Bento.Error;

Bento.Register.Controller('BookingsController', function(controller) {

  function buttonhack(link) {
    return `<a href="${link}" class="button-balanced button button-block" style="margin-bottom:-57px;z-index: 1000;">Upgrade Now</a>`;
  }

  function *checkVersion(obj){
    var payload = obj.payload;
    var request = obj.request;
    let osVersion = 0;
    let header = request.header['user-agent'];
    let iPhone = header.match(/iPhone/);

    // App versions between android and iphone are dramatically different for some reason.
    let minApp = iPhone ? 91 : 872; 
    let minMarketLink = 797; 
    let version = parseInt(payload.version, 10) || 0;
    var copy;

    if(version !== obj.auth.user.version) {
       yield obj.auth.user.update({version: version});
    }

    if(payload.source !== 'web' && version < minApp) {
      if(iPhone) {
        osVersion = header.match(/OS (\d+)/);
        if(osVersion) {
          osVersion = parseInt(osVersion[1], 10);
          // if older than iOS 10 then don't even try
          // to upgrade
          if(osVersion < 10) {
            return true;
          }
        } 
      } else {
        osVersion = header.match(/Android (\d+)/);
        if(osVersion) {
          osVersion = parseInt(osVersion[1], 10);
          // if older than Android 5 we don't ask
          if(osVersion < 5) {
            return true;
          }
        }
      }
      // If we can't determine the version of the OS
      // that the user is using then we bail and don't
      // force an upgrade to an unknown version.
      if(!osVersion) {
        return true;
      }

      if(iPhone) {
        copy = buttonhack("itms-apps://itunes.apple.com/app/id1051144802");
      } else if ( version < minMarketLink) {
        copy = 'Please upgrade WaiveCar at the Google Play Store.'; 
      } else {
        copy = buttonhack("market://details?id=com.waivecar.app");
      }

      throw error.parse({
        code    : `BOOKING_OLD_VERSION`,
        message : `You'll need to upgrade the WaiveCar App before booking. ${ copy }`
      }, 400);

    }
  }

  /**
   * Creates a new booking request.
   * @return {Object}
   */
  controller.create = function *() {
    yield checkVersion(this);
    return yield booking.create(this.payload, this.auth.user);
  };

  /**
   * Returns a list of bookings.
   * @return {Object}
   */
  controller.index = function *() {
    return yield booking.index(this.query, this.auth.user);
  };

  controller.count = function *() {
    return yield booking.count(this.query, this.auth.user);
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
      case 'extend'   : return yield booking.extend(id, this.auth.user);
      case 'close'    : return yield booking.close(id, this.auth.user);
      case 'cancelforfeit' : return yield booking.cancelForfeit(id, this.auth.user);
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
