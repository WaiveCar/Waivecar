'use strict';

var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('EndRideController', [
  '$rootScope',
  '$scope',
  '$settings',
  '$window',
  '$state',
  '$stateParams',
  '$ride',
  '$geocoding',
  '$ionicLoading',
  '$modal',
  '$uploadImage',
  '$message',
  '$data',
  'LocationService',
  '$injector',
  function($rootScope, $scope, $settings, $window, $state, $stateParams, $ride, $geocoding, $ionicLoading, $modal, $uploadImage, $message, $data, LocationService, $injector) {
    $scope.service = $ride;
    var ctrl = this;
    var Reports = $injector.get('Reports');

    ctrl.service = $ride;

    var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = (new Date()).getDay();
    var myweek = week.concat(week).slice(today + 2, today + 2 + 6);
    myweek[5] += " (next)";
    myweek.unshift('Today', 'Tomorrow');

    ctrl.dayValues = myweek.map(function(row) {
      today %= 7;
      return { id: today++, name: row };
    });
    //
    // this is because angular is fucking stupid. html select says the value of options can be duplicates
    // but angular has a huge honking bug in its overdesigned piece of shit code so it bludgeons the values
    // in a hash and makes things unselectable ... fuck angular and fuck the bozos who made it. html is
    // my templating language for html ... it's already a fucking UX templating language give me a fucking
    // break.
    //
    // this will be undone later on through an abs call.
    //
    ctrl.dayValues[7].id *= -1;

    ctrl.hourModifier = 'am';
    ctrl.street = {
      streetSignImage: null,
      streetDay: null,
      streetHours: null,
      streetMinutes: null,
    };

    ctrl.isWaivePark = false;
    ctrl.brokenPhone = false;
    ctrl.noPictureWarned = false;

    ctrl.pictures = {
      front: null,
      left: null,
      rear: null,
      right: null,
      other: null
    }
    ctrl.car = $data.active.cars;
    // used for the images.
    ctrl.model = ctrl.car && ctrl.car.model ? ctrl.car.model.split(' ')[0].toLowerCase() : 'ioniq'; 

    // Attach methods
    ctrl.submit = submit;
    ctrl.addPicture = addPicture;
    ctrl.loadBooking = loadBooking;
    ctrl.loadCar = loadCar;
    ctrl.init = init;

    ctrl.type = 'street';
    ctrl.minhours = 12;
    ctrl.isHub = false;
    ctrl.okText = "My parking is OK";

    function init() {
      // Wait for service to initialize
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {

        console.log('[end-ride] Service initialized: %s', isInitialized);
        if (isInitialized !== true) {
          console.log("bailing");
          return;
        }
        console.log("geocoding");
        //rideServiceReady();

        geocode();
      });
      loadBooking($stateParams.id)
        .then(function(booking) {
          ctrl.booking = booking;
          $ride.setBooking(booking.id);

          var start = _.find(booking.details, { type: 'start' });
          ctrl.hours = moment().diff(moment(start.createdAt), 'hours');

          return loadCar(booking.carId);
        })
        .then(function(car) {
          ctrl.car = car;
        })
        .catch(function(err) {
          console.log('init failed: ', err);
        });
    }
    init();
    
    function loadBooking(id) {
      return $data.resources.bookings.get({ id: id }).$promise;
    }

    function loadCar(id) {
      return $data.activate('cars', id);
    }
     
    function geocode() {
      if (!($rootScope.currentLocation && $rootScope.currentLocation.latitude)) {
        return null;
      }
      return $geocoding($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude)
        .then(function (location) {
          if($stateParams.zone) {
            if ($stateParams.zone.type === 'hub') {
              ctrl.isHub = true;
              ctrl.okText = "Finish";
            } else if ($stateParams.zone.type === 'waivePark') {
              ctrl.okText = 'Finish';
              ctrl.isWaivePark = true;
            } 

            // BUGBUG: this information should be in the database. 1235 is santa monica
            if($stateParams.zone.id === 1235) {
              ctrl.minhours = 3;
            } 
          }
          // we do this so we don't get some annoying UX flash
          ctrl.geocodeLoaded = true;

          $ride.state.parkingLocation.addressLine1 = location.display_name;
        })
        .catch(function(err) {
          console.log('geocode failed: ', err);
        })
        .finally(function () {
          $ionicLoading.hide();
        });
    }

    function addPicture(type) {
      $uploadImage({
        endpoint: '/files?bookingId=' + $stateParams.id,
        type: type,
        filename: type + $stateParams.id + '_' + Date.now() + '.jpg',
        sourceList: ['camera'] 
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];
        if (result) {
          result.style = {
            'background-image': 'url(' + $settings.uri.api + '/file/' + result.id + ')'
          };
          if (type === 'streetSignImage') {
            ctrl.street.streetSignImage = result;
          } else { 
            ctrl.pictures[type] = result;
            ctrl.pictures[type].type = type;
          }
        }
      })
      .catch(function (err) {
        var message = err.message;
        if (err instanceof $window.FileTransferError) {
          if (err.body) {
            var error = angular.fromJson(err.body);
            if (error.message) {
              message = error.message;
            }
          }
        }
        submitFailure(message);
      });
    }


    function parkingSignCheck() {
      var payload = Object.assign({}, ctrl.street);

      if (!ctrl.isHub && !ctrl.isWaivePark && ctrl.type === 'street') {

        if(!ctrl.street.streetHours) {
          if(ctrl.brokenPhone) {
            payload.nophoto = true;
          } else if(!ctrl.street.streetSignImage) {
            return [false, noSignCheck()];
          }

          payload.nosign = true;
        } else {
          var hours = parseInt(ctrl.street.streetHours.split(/:/)[0], 10);
          if (isNaN(hours) || hours > 24) {
            return [false, submitFailure('The time you have entered is invalid')];
          }
          payload.expireHour = {am: 0, pm: 12}[ctrl.hourModifier] + hours % 12;
        }
      }

      payload.type = ctrl.type;
      return [true, payload];
    }

    function submitParkingSign(payload) {
      $ride.setParkingDetails(payload);
      return $ride.processEndRide().then(function () {
        return $ride.checkAndProcessActionOnBookingEnd();
      });
    }

    function submit() {
      var res = parkingSignCheck();

      if(!res[0]) {
        return;
      }

      var picsIx = 0;
      var picsToSend = [];

      for (var picture in ctrl.pictures) {
        if(ctrl.pictures[picture]) {
          picsIx ++;
        }
        picsToSend.push(ctrl.pictures[picture]);
      }

      if(picsIx < 4 && !ctrl.noPictureWarned) {
        return pictureWarn();
      }

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

      $data.resources.bookings.endcheck({id: ctrl.booking.id}).$promise.then(function(carCheck) {
        if(carCheck.message) {
          $ionicLoading.hide();
          return submitFailure(carCheck.message);
        }

        Reports.create({
          bookingId: $stateParams.id,
          description: null,
          files: picsToSend
        });

        submitParkingSign(res[1]);
        $ionicLoading.hide();
      });
    }
    
    function submitFailure(message) {
      $ionicLoading.hide();
      var endRideModal;

      $modal('result', {
        icon: 'x-icon',
        title: message,
        actions: [{
          text: 'Ok',
          className: 'button-balanced',
          handler: function () {
            endRideModal.remove();
          }
        }]
      })
      .then(function (_modal) {
        _modal.show();
        endRideModal = _modal;
        endRideModal.show();
      });
    }
  
    function warn(title, success, failure) {
      var modal;
      return $modal('result', {
        icon: 'x-icon',
        title: 'Warning',
        message: title,
        actions: [{
          text: success.text,
          className: 'button-balanced',
          handler: function () {
            modal.remove();
            if(success.cb) {
              success.cb();
            }
          }
        }, {
          text: failure.text,
          className: 'button-dark',
          handler: function () {
            modal.remove();
            if(failure.cb) {
              failure.cb();
            }
          }
        }]
      })
      .then(function (_modal) {
        _modal.show();
        modal = _modal;
        modal.show();
      });
    }

    function pictureWarn() {
      warn(
        "Photos make sure you won't get blamed for what happens once you walk away from the car and protects you against things the next driver may do.",
        { text: "I'll take photos!" },
        { text: "I accept responsibility",
          cb: function() {
            ctrl.noPictureWarned = true;
            submit();
          }
        }
      );
    }

    function noSignConfirm() {
      warn(
        "If you misreport and get a ticket, you'll be held responsible for the ticket plus a fee.", 
        { text: 'Go back' },
        { text: "There is no sign",
          cb: function() {
            ctrl.brokenPhone = true;
            submit();
          }
        }
      );
    }

    function noSignCheck() {
      warn(
        "If there is no sign, please take a photo of the intersection showing there's no sign.",
        { text: 'Go back' },
        { text: "I can't take a photo",
          cb: noSignConfirm
        }
      );
    }
  }
]);
