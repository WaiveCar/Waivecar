'use strict';

var angular = require('angular');
var moment = require('moment');

require('../services/zendrive-service');

module.exports = angular.module('app.controllers').controller('ParkingLocationController', [
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
  'ZendriveService',
  '$message',
  '$data',
  'LocationService',
  function($rootScope, $scope, $settings, $window, $state, $stateParams, $ride, $geocoding, $ionicLoading, $modal, $uploadImage, ZendriveService, $message, $data, LocationService ) {
    $scope.service = $ride;
    var ctrl = this;

    ctrl.service = $ride;
    ctrl.type = 'street';
    ctrl.lot = {
      lotFreePeriod: false,
      lotFreeHours: null,
      lotHours: null,
      lotMinutes: null,
      lotLevel: null,
      lotSpot: null,
      lotOvernightRest: false
    };
    ctrl.street = {
      streetSignImage: null,
      streetHours: null,
      streetMinutes: null,
      streetOvernightRest: false
    };
    
    ctrl.overrideStreetRestrictions = false;

    // Attach methods
    ctrl.setType = setType;
    ctrl.geocode = geocode;
    ctrl.submit = submit;
    ctrl.addPicture = addPicture;
    ctrl.minhours = 3;
    ctrl.init = init;

    ctrl.init();

    function init() {
      // Wait for service to initialize
      var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {

        console.log('[end-ride] Service initialized: %s', isInitialized);
        if (isInitialized !== true) {
          return;
        }
        rideServiceReady();

        // Kick off geocoding
        ctrl.geocode();
      });
    }

    /**
     * Toggle parking type
     * @param {String} type Type of parking info
     * @returns {Void} none
     */
    function setType(type) {
      ctrl.type = type;
    }

    function geocode() {
      if (!($rootScope.currentLocation && $rootScope.currentLocation.latitude)) {
        return null;
      }
      return $geocoding($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude)
        .then(function (location) {
          // BUGBUG: this information should be in the database. 1235 is santa monica
          if($stateParams.zone.id === 1235) {
            ctrl.minhours = 3;
          } else {
            ctrl.minhours = 12;
          }
          ctrl.zone = $stateParams.zone.name;
          $ride.state.parkingLocation.addressLine1 = location.display_name;
          ctrl.address = location.address;
          var addr = ctrl.address;
          //
          // This is an unfortunate consequence of how things are being scrolled in android
          // see https://github.com/clevertech/Waivecar/issues/547 ... there's probably
          // clever ways to do this in CSS which are error-prone and fragile.  So instead,
          // because the input scroll appears to look for adjacent elements, we need to
          // put this address in there for every instance of the ng-if clause... in order
          // to do it 'once' (as in DRY), we do it here.
          //
          ctrl.address_markup = [ ];
          if(addr.house_number || addr.road) {
            ctrl.address_markup.push('<div>' + [addr.house_number, addr.road].join(' ').trim() + '</div>');
          }
          if(addr.city) {
            addr.city += ', ';
          } else {
            addr.city = '';
          }
          ctrl.address_markup = ctrl.address_markup.concat([
              addr.city,
              addr.state,
              addr.postcode
          ]).join(' ');
        })
        .catch(function(err) {
          console.log('geocode failed: ', err);
        })
        .finally(function () {
          $ionicLoading.hide();
        });
    }

    /**
     * Uploads image to server for street sign
     * @returns {Void} null
     */
    function addPicture () {
      $uploadImage({
        endpoint: '/files?bookingId=' + $stateParams.id,
        filename: 'parking_' + $stateParams.id + '_' + Date.now() + '.jpg',
      })
      .then(function (result) {
        if (result && Array.isArray(result)) result = result[0];

        if (result) {
          result.style = {
            'background-image': 'url(' + $settings.uri.api + '/file/' + result.id + ')'
          };
          ctrl.street.streetSignImage = result;
        }
      })
      .catch(function (err) {
        // for testing to skip photo. See #1113

        // var result = {id: 'asdf'}.style = {
        //   'background-image': 'url(' + $settings.uri.api + '/file/asdf' +  ')'
        // };
        // ctrl.street.streetSignImage = result;
        // return;
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
    };

    function submit() {

      // Force users to take pictures. See #1113
      if ((ctrl.type === 'street' || ctrl.type === 'lot') && !ctrl.street.streetSignImage) {
        return submitFailure('Ending here requires a photo of the parking sign.');
      }
      
      if (!ctrl.overrideStreetRestrictions && checkIsParkingRestricted()) {
        return parkingRestrictionFailure();
      }

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });

      var isNightTime = moment().hours() >= 23 || moment().hours() < 5;

      goToEndRide(isNightTime);
    }
    
    function dayLess(date1, date2) {
      
      if (date1.day < date2.day) {
        return true;
      }
      
      return timeLess(date1, date2);
    }
    
    function timeLess(date1, date2) {
      if (date1.hour < date2.hour) {
        return true;
      }
      
      if (date1.hour > date2.hour) {
        return false;
      }
      
      return date1.minute <= date2.minute;
    }
    
    function checkTimeRestrictions(restrictions) {
  
      var now = moment();
      var current = {
        day: now.isoWeekday(),
        hour: now.hour(),
        minute: now.minute()
      };
      
      var restricted = false;
      
      restrictions.forEach(function (restriction) {
        var begin = restriction[0];
        var end = restriction[1];
        
        //ALL days case
        if (begin.day === 0) {
  
          if (begin.hour <= end.hour) {
            if (timeLess(begin,current) && timeLess(current, end)) {
              restricted = true;
            }
          } else {
            if (timeLess(begin,current) || timeLess(current, end)) {
              restricted = true;
            }
          }
          
        } else {
          if (begin.day <= end.day) {
            
            if (dayLess(begin,current) && dayLess(current, end)) {
              restricted = true;
            }
          } else {
            
            if (dayLess(begin,current) || dayLess(current, end)) {
              restricted = true;
            }
          }
        }
      });
      
      return restricted;
    }
    
    function checkIsParkingRestricted() {
      if (!$rootScope.currentLocation ) {
        return false;
      }
      
      if (!$data.instances.locations) {
        return false;
      }
      
      var car = $rootScope.currentLocation;
      var locations = $data.instances.locations;
      var hasRestrictions = false;
      
      var threshold = 20.0; //20 meters
  
      var carLatLngArr = [car.longitude, car.latitude];
      
      locations.forEach(function (location) {
        if (location.type !== 'parking') {
          return;
        }

        var minDistance = Number.MAX_SAFE_INTEGER;
        for(var i = 0; i < location.shape.length - 1; ++i) {
          var dist = LocationService.getDistanceToParkingLine(location.shape[i], location.shape[i + 1], carLatLngArr);
          minDistance = Math.min(minDistance, dist);
        }
        
        if (checkTimeRestrictions(location.restrictions) &&  minDistance < threshold) {
          hasRestrictions = true;
        }
        
      });
      
      return hasRestrictions;
    }

    function goToEndRide(isNightTime) {
      var payload;

      // Check which type we are submitting
      if (ctrl.type === 'lot') {
        if (ctrl.lot.lotHours < ctrl.minhours && !ctrl.lot.lotFreePeriod) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least ' + ctrl.minhours + ' hours.');
        if (isNightTime && ctrl.lot.lotOvernightRest) return submitFailure('You can\'t return your WaiveCar here. If the car is ticketed or towed, you\'ll be responsible for the fees.');
        payload = ctrl.lot;
      } else if (ctrl.type === 'street') {
        if (ctrl.street.streetHours < ctrl.minhours) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least ' + ctrl.minhours + ' hours.');
        if (isNightTime && ctrl.street.streetOvernightRest) return submitFailure('You can\'t return your WaiveCar here. If the car is ticketed or towed, you\'ll be responsible for the fees.');
        payload = ctrl.street;
      }

      //ZendriveService.stop();
      payload.type = ctrl.type;
      $ride.setParkingDetails(payload);
      return $ride.processEndRide().then(function () {
        $ionicLoading.hide();
        return $state.go('end-ride', {id: $ride.state.booking.id});
      });
    }

    /**
     * Displays error message
     * @param {String} message Message to display
     * @returns {Void} null
     */
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
  
    function parkingRestrictionFailure() {
      $ionicLoading.hide();
      var endRideModal;
    
      return $modal('result', {
        icon: 'x-icon',
        title: 'Looks like there are parking restriction on this street. Please check careful.',
        actions: [{
          text: 'I checked. There are no parking restrictions',
          className: 'button-balanced',
          handler: function () {
            ctrl.overrideStreetRestrictions = true;
            endRideModal.remove();
          }
        },{
          text: 'Ok',
          className: 'button-dark',
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
  }
]);
