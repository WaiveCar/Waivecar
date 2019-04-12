'use strict';

let booking = require('../lib/booking-service');
let Hacks   = require('../lib/dirtyhacks');
let error   = Bento.Error;

Bento.Register.Controller('BookingsController', function(controller) {

  function *checkVersion(obj, message){
    var payload = obj.payload;
    var request = obj.request;
    let osVersion = 0;
    let header = request.header['user-agent'];

    if(!header) {
      return true;
    }

    let iPhone = header.match(/iPhone/);

    // App versions between android and iphone are dramatically different for some reason.
    // minVersion
    let minApp = iPhone ? 153 : 913;
    let minMarketLink = 797; 
    let version = parseInt(payload.version, 10) || 0;
    var copy;

    if(!message) {
      if(!iPhone) {
        message = "Your WaiveCar is reserved.<br/><b>A new app is needed for the Ioniqs and Chevys.</b><ol style='text-align:left;margin:.5em 0 .75em 2.5em;list-style-type:decimal'><li>Install the new app</li><li>Uninstall the old app with the square logo</li><li>Enjoy!</li></ol>";
      } else {
        message = "Your WaiveCar is reserved. However, you need to upgrade the App before starting the ride.";
      }
    }

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
        copy = Hacks.button("itms-apps://itunes.apple.com/app/id1051144802", 'Upgrade Now');
      } else if ( version < minMarketLink) {
        copy = 'Please upgrade WaiveCar at the Google Play Store.'; 
      } else {
        copy = Hacks.button("market://details?id=com.waivecardrive.app", 'Upgrade Now');
      }

      throw error.parse({
        code    : `BOOKING_OLD_VERSION`,
        message : `${ message } ${ copy }`
      }, 400);

    }
  }

  controller.create = function *() {
    let res = yield booking.create(this.payload, this.auth.user);
    yield checkVersion(this);
    return res;
  };

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
    return yield booking.show(id, this.auth.user, this.query);
  };

  controller.getParkingDetails = function *(id) {
    return yield booking.getParkingDetails(id);
  };

  controller.signIssue = function *(adjective) {
    return yield booking.signIssue(adjective, this.payload, this.auth.user);
  }

  /**
   * Initiates the booking and starts the ride.
   * @param  {Number} id
   * @param  {String} action
   * @return {Object}
   */
  controller.update = function *(id, action) {
    if (action === 'start') {
      yield checkVersion(this, "Please upgrade the WaiveCar app before continuing");
    }
    switch (action) {
      case 'start'    : return yield booking.start(id, this.auth.user);
      case 'ready'    : return yield booking.ready(id, this.auth.user);
      case 'end'      : return yield booking.end(id, this.auth.user, this.query, this.payload);
      case 'canend'   : return yield booking.canEndHere(id, this.auth.user, this.query, this.payload);
      case 'endcheck' : return yield booking.endCheck(id, this.auth.user, this.query, this.payload);
      case 'complete' : return yield booking.complete(id, this.auth.user, this.query, this.payload);
      case 'extend'   : return yield booking.extend(id, this.query, this.auth.user);
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

  controller.extendForFree = function *(id, time) {
    return yield booking.extendForFree(id, this.auth.user, time);
  };

  /**
   * Updates all the details missing their addresses.
   * @yield {[type]} [description]
   */
  controller.patchAddressDetails = function *() {
    return yield booking.patchAddressDetails();
  };

  controller.cancel = function *(id) {
    return yield booking.cancel(id, this.auth.user);
  };

  controller.checkCarParityWithUser = function *(id) {
    return yield booking.checkCarParityWithUser(id, this.payload, this.auth.user);
  };

  controller.userContribution = function *(id) {
    return  yield booking.userContribution(id, this.auth.user);
  };

  controller.updateWaiveworkPayment = function *(bookingId) {
    return yield booking.updateWaiveworkPayment(bookingId, this.payload);
  }

  controller.failedWaiveworkPayment = function *(bookingId) {
    return yield booking.failedWaiveworkPayment(bookingId, this.payload);
  }

  return controller;

});
