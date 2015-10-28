'use strict';
var angular = require('angular');
var async = require('async');
var when = require('when');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('BookingService', [
  '$auth',
  '$data',
  function($auth, $data) {
    var s = {};
    var cachedCarId;

    var status = {
      userIsActive: {
        valid: false,
        description: {
          valid: 'Account Activated',
          invalid: 'Account Not Activated',
        },
        path: 'auth-account-verify({fromBooking: true})'
      },
      hasValidLicense: {
        valid: false,
        description: {
          valid: 'Valid Driver\'s License',
          invalid: 'Missing Driver\'s License',
        },
        path: 'licenses-photo-new({fromBooking: true})'
      },
      hasValidCreditCard: {
        valid: false,
        description: {
          valid: 'Valid Credit Card',
          invalid: 'Missing Credit Card',
        },
        path: 'credit-cards-new({fromBooking: true})'
      }
    };

    var isReadyToBook = false;

    function updateStatus(carId) {
      cachedCarId = carId;
      status.userIsActive.valid = !!($auth.me && $auth.me.status === 'active');

      return when.promise(function(resolve, reject) {

        async.parallel({
          hasValidLicense: function(done) {
            return $data.resources.licenses.query().$promise
              .then(function(licenses) {
                var latestLicense = _.chain(licenses).sortBy('createdAt').last().value();
                done(null, !!latestLicense);
              })
              .catch(done);

          },
          hasValidCreditCard: function(done) {
            return $data.resources.Card.query().$promise
              .then(function(cards) {
                done(null, cards.length > 0);
              })
              .catch(done);

          },

          hasActiveBooking: function(done){
            return $data.resources.bookings.query().$promise
              .then(function(bookings){
                var first = bookings[0];
                if(first){
                  s.activeBooking = first;
                }
                done(null, !!first);
              })
              .catch(done);
          }

        }, function(err, results) {
          if (err) {
            return reject(err);
          }

          status.hasValidLicense.valid = results.hasValidLicense;
          status.hasValidCreditCard.valid = results.hasValidCreditCard;

          s.hasActiveBooking = results.hasActiveBooking;

          isReadyToBook = _(status).every(function(item) {
            return item.valid === true;
          });

          resolve();

        });

      });

    }

    s.userCanBook = function(carId, fromCache) {
      if (fromCache) {
        return when(isReadyToBook);
      }

      return updateStatus(carId)
        .then(function() {
          return isReadyToBook;
        });

    };

    s.getCurrentStatus = function(carId, fromCache) {
      if (fromCache) {
        return when(status);
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

    return s;

  }
]);
