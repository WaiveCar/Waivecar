'use strict';
var angular = require('angular');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('BookingService', [
  '$auth',
  '$data',
  '$q',
  function($auth, $data, $q) {
    var s = {};
    var cachedCarId;

    var status = {
      phoneVerified: {
        valid: false,
        description: {
          valid: 'Phone Number has been verified',
          invalid: 'Verify Phone Number',
        },
        path: 'auth-account-verify({ fromBooking: true })'
      },
      hasValidLicense: {
        valid: false,
        description: {
          valid: 'Valid Driver\'s License',
          invalid: 'Add Driver\'s License',
        },
        path: 'licenses-new({ fromBooking: true })'
      },
      hasValidCreditCard: {
        valid: false,
        description: {
          valid: 'Valid Credit Card',
          invalid: 'Add Payment Method',
        },
        path: 'credit-cards-new({ fromBooking: true })'
      }
    };

    var isReadyToBook = false;

    function updateStatus(carId) {
      cachedCarId = carId;
      status.phoneVerified.valid = !!($auth.me && $auth.me.phoneVerified);

      function hasValidLicense () {
        return $data.resources.licenses.query().$promise
          .then(function(licenses) {
            var latestLicense = _.chain(licenses).sortBy('createdAt').last().value();
            return !!latestLicense;
          });
      }

      function hasValidCreditCard () {
        return $data.resources.Card.query().$promise
          .then(function(cards) {
            return cards.length > 0;
          });
      }

      function hasActiveBooking () {
        return s.getActiveBooking()
          .then(function(booking){
            if (booking) {
              s.activeBooking = booking;
            }
            return !!booking;
          });
      }

      return $q.all({
        hasValidLicense: hasValidLicense,
        hasValidCreditCard: hasValidCreditCard,
        hasActiveBooking: hasActiveBooking
      })
        .then(function (results) {
          status.hasValidLicense.valid = results.hasValidLicense;
          status.hasValidCreditCard.valid = results.hasValidCreditCard;

          s.hasActiveBooking = results.hasActiveBooking;

          isReadyToBook = _(status).every(function(item) {
            return item.valid;
          });
        });
    }

    s.userCanBook = function(carId, fromCache) {
      if (fromCache) {
        return $q.when(isReadyToBook);
      }

      return updateStatus(carId)
        .then(function() {
          return isReadyToBook;
        });

    };

    s.getCurrentStatus = function(carId, fromCache) {
      if (fromCache) {
        return $q.when(status);
      }

      return updateStatus(carId)
        .then(function() {
          return status;
        });

    };

    s.getNumberOfOpenItems = function() {
      return _.where(status, {
        valid: false
      }).length;

    };

    s.getReturnParams = function() {
      return {
        id: cachedCarId,
        displayRequirements: s.getNumberOfOpenItems() > 1
      };

    };

    s.getActiveBooking = function(bookingId) {
      var promise;

      if(bookingId){
        promise = $data.resources.Booking.get({id: bookingId}).$promise;
      } else {
        promise = $data.resources.bookings.query().$promise
          .then(function(bookings) {
            return _(bookings).findWhere({
              status: 'new-booking'
            });
          });

      }

      return promise.then(function(booking){
        if(!booking){
          return null;
        }

        return $data.resources.Car.get({id: booking.carId}).$promise
          .then(function(car){
            booking.car = car;
            return booking;
          });

      });


    };

    return s;

  }
]);
