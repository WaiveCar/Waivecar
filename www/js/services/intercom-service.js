'use strict';
var angular = require('angular');


module.exports = angular.module('app.services').factory('IntercomService', [
  '$window',

  function ($window) {

    this.registerIdentifiedUser = function(user) {
      if (!intercom()){
        return;
      }

      var iUser = createIntecomUserModel(user);
      intercom().registerIdentifiedUser();
    };

    this.registerUnidentifiedUser = function () {

      if (!intercom()){
        return;
      }

      intercom().registerUnidentifiedUser();
    };


    this.emitBookingEvent = function (bookin, extProps) {
      if (!intercom()){
        return;
      }

      var event = {
        status: booking.status,
        bookingId: booking.id,
        carId: booking.carId
      };


      intercom().logEvent("booking", Object.assign(event, extProps));
    };

    this.emitCreditCardEvent = function (status) {
      intercom().logEvent("credit-card", {
        status: status
      });
    };

    function intercom() {
      if (!$window.cordova) {
        return null;
      }
      return $window.cordova.plugins.intercom;
    }

    function createIntecomUserModel(user) {
      var iUser = {
        userId: user.id,
        custom_attributes: {
          credit: user.credit,
          status: user.status
        }
      };

      if (user.avatar) {
        iUser.avatar = user.avatar;
      }

      if (user.phone) {
        iUser.phone = user.phone;
      }

      //TODO: number of credit cards

    }

  }]);
