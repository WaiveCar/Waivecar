'use strict';
var angular = require('angular');


module.exports = angular.module('app.services').service('IntercomService', [
  '$window',

  function ($window) {

    this.registerIdentifiedUser = function(user) {
      if (!intercom()){
        return;
      }

      var iUser = createIntecomUserModel(user);
      intercom().registerIdentifiedUser(iUser);
    };

    this.registerUnidentifiedUser = function () {

      if (!intercom()){
        return;
      }

      intercom().registerUnidentifiedUser();
    };


    this.emitBookingEvent = function (booking, extProps) {
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

      if (!intercom()){
        return;
      }

      intercom().logEvent("credit-card", {
        status: status
      });
    };

    this.setLauncherVisibility = function() {

      if (!intercom()){
        return;
      }

      intercom().setLauncherVisibility('VISIBLE');
    };

    function intercom() {
      if (!$window.cordova) {
        return {
          registerIdentifiedUser: function(user) {
            console.log("registerIdentifiedUser", JSON.stringify(user));
          },
          registerUnidentifiedUser: function(){
            console.log("registerUnidentifiedUser");
          },
          logEvent: function(name, event) {
            console.log("logEvent", name, JSON.stringify(event));
          },
          setLauncherVisibility: function() {
            console.log("setLauncherVisibility");
          }
        };
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

      return iUser;
    }

  }]);
