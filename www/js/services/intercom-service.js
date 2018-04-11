'use strict';
var angular = require('angular');


module.exports = angular.module('app.services').service('IntercomService', [
  '$window',
  '$data',

  function ($window, $data) {
    function intercom() {
      if ($window.cordova && $window.cordova.plugins.intercom) {
        return $window.cordova.plugins.intercom;
      }

      return {
        registerIdentifiedUser: function(user) {
          console.log('registerIdentifiedUser', JSON.stringify(user));
        },
        updateUser: function(user) {
          console.log('updateUser', JSON.stringify(user));
        },
        registerUnidentifiedUser: function(){
          console.log('registerUnidentifiedUser');
        },
        logEvent: function(name, event) {
          console.log('logEvent', name, JSON.stringify(event));
        },
        setLauncherVisibility: function(arg) {
          console.log('setLauncherVisibility:' + arg );
        },
        registerForPush: function() {
          console.log('registerForPush');
        },
        setBottomPadding: function(padding) {
          console.log('setBottomPadding');
        }
      };
    }

    this.registerForPush = function() {
      intercom().registerForPush();
    };

    this.registerIdentifiedUser = function(user) {
      intercom().registerIdentifiedUser({userId: user.id});

      var iUser = createIntecomUserModel(user);
      intercom().updateUser(iUser);

      // this.updateCardsInfo(user);
      // this.updateLicensesInfo(user);
      // this.updateBookingsInfo(user);
    };

    this.registerUnidentifiedUser = function () {
      intercom().registerUnidentifiedUser();
    };

    this.emitBookingEvent = function (booking, extProps) {
      var event = {
        status: booking.status,
        bookingId: booking.id,
        carId: booking.carId
      };

      intercom().logEvent('booking', Object.assign(event, extProps));
    };

    this.emitCreditCardEvent = function (status, cardNumber) {
      var partialNumber = '********' + cardNumber.slice(-4);

      intercom().logEvent('credit-card', {
        status: status,
        card: partialNumber
      });
    };

    this.setLauncherVisibility = function(show) {
      intercom().setLauncherVisibility(show ? 'VISIBLE' : 'GONE');
    };

    this.setBottomPadding = function(padding) {
      intercom().setBottomPadding(padding);
    }

    function createIntecomUserModel(user) {
      var iUser = {
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
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

      return iUser;
    }

    this.updateCardsInfo = function(user) {
      $data.resources.Card.query({ userId: user.id }).$promise
        .then(function (cards) {

          intercom().updateUser({
            custom_attributes: {
              numberOfCreditCards: cards.length
            }
          });
        });
    };

    this.updateLicensesInfo = function(user) {
      $data.resources.licenses.query({ userId: user.id }).$promise
        .then(function (licenses) {
          var licenseCheck = 'N/A';
          if (licenses.length > 0 ) {
            licenseCheck = licenses[0].status;
          }

          intercom().updateUser({
            custom_attributes: {
              licenseCheck: licenseCheck
            }
          });

        });
    };

    this.updateBookingsInfo = function(user) {
      $data.resources.bookings.completedCount({ userId: user.id }).$promise
        .then(function (bookings) {
          intercom().updateUser({
            custom_attributes: {
              completedBookings: bookings.bookingsCount
            }
          });
        });

      $data.resources.bookings.reservationsCount({ userId: user.id }).$promise
        .then(function (bookings) {
          intercom().updateUser({
            custom_attributes: {
              reservations: bookings.bookingsCount
            }
          });
        });
    };

  }]);
