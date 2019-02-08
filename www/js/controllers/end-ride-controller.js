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
    ctrl.dayValues = [
      {
        id: -2,
        name: 'Today', 
      },
      {
        id: -1,
        name: 'Tomorrow',
      },
      {
        id: 0,
        name: 'Sunday', 
      },
      {
        id: 1,
        name: 'Monday',
      },
      {
        id: 2,
        name: 'Tuesday',
      },
      {
        id: 3,
        name: 'Wednesday',
      },
      {
        id: 4,
        name: 'Thursday',
      },
      {
        id: 5,
        name: 'Friday',
      },
      {
        id: 6,
        name: 'Saturday',
      }
    ];
    ctrl.hourModifier = 'am';
    ctrl.street = {
      streetSignImage: null,
      streetDay: null,
      streetHours: null,
      streetMinutes: null,
      streetOvernightRest: false,
    };

    ctrl.isWaivePark = false;
    ctrl.overrideStreetRestrictions = false;

    ctrl.pictures = {
      front: null,
      left: null,
      rear: null,
      right: null,
      other: null
    }
    ctrl.appPics = false;
    ctrl.car = $data.active.cars;
    ctrl.model = ctrl.car.model ? ctrl.car.model.split(' ')[0].toLowerCase() : 'ioniq'; 

    // Attach methods
    ctrl.setType = setType;
    ctrl.geocode = geocode;
    ctrl.submit = submit;
    ctrl.addPicture = addPicture;
    ctrl.toggle = toggle;
    ctrl.minhours = 3;
    ctrl.loadBooking = loadBooking;
    ctrl.loadCar = loadCar;
    ctrl.init = init;
    ctrl.skipToEnd = skipToEnd;
    ctrl.goToEndRide = goToEndRide;

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
      loadBooking($stateParams.id)
        .then(function(booking) {
          ctrl.booking = booking;
          $ride.setBooking(booking.id);
          //ZendriveService.stop(booking.id);

          var start = _.find(booking.details, { type: 'start' });
          var end = _.find(booking.details, { type: 'end' });
          ctrl.hours = moment().diff(moment(start.createdAt), 'hours');
          ctrl.minutes = moment().diff(moment(start.createdAt), 'minutes');
          ctrl.minutes = ("" + (100 + ctrl.minutes % 60)).slice(1);

          return loadCar(booking.carId);
        })
        .then(function(car) {
          ctrl.car = car;
        })
        .catch(function(err) {
          console.log('init failed: ', err);
        });
    }
    
    function loadBooking(id) {
      return $data.resources.bookings.get({ id: id }).$promise;
    }

    function loadCar(id) {
      return $data.activate('cars', id);
    }
     
    function setType(type) {
      ctrl.type = type;
    }

    function toggle(field) {
      this[field] = !this[field];
    }

    function geocode() {
      if (!($rootScope.currentLocation && $rootScope.currentLocation.latitude)) {
        return null;
      }
      return $geocoding($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude)
        .then(function (location) {
          if ($stateParams.zone.type === 'hub') {
            ctrl.isHub = true;
            ctrl.okText = "Finish";
          } else if ($stateParams.zone.type === 'waivePark') {
            ctrl.okText = 'Finish';
            ctrl.isWaivePark = true;
          } else {
            ctrl.okText = "My parking is OK";
          }
          // we do this so we don't get some annoying UX flash
          ctrl.geocodeLoaded = true;

          // BUGBUG: this information should be in the database. 1235 is santa monica
          if($stateParams.zone.id === 1235) {
            ctrl.minhours = 3;
          } else {
            ctrl.minhours = 12;
          }
          ctrl.zone = $stateParams.zone.name ? ' for' +  $stateParams.zone.name : null;
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
          if (ctrl.street.streetSignImage && ctrl.pictures['front'] && ctrl.pictures['left'] && ctrl.pictures['rear'] && ctrl.pictures['right']) {
            ctrl.allPics = true;
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

    function submit() {
      var issues = [];
      // Force users to take pictures. See #1113
      if(!ctrl.isHub && !ctrl.isWaivePark && ctrl.type === 'street' && !ctrl.street.streetSignImage) {
        issues.push('Ending here requires a photo of the parking sign.');
      }

      if (!ctrl.pictures.front || !ctrl.pictures.left || !ctrl.pictures.right || !ctrl.pictures.rear) {
        issues.push('Please take pictures of all sides of the vehicle before proceeding.');
      }
      if(issues.length) {
        return submitFailure(issues.join(' '));
      }

      if (!ctrl.overrideStreetRestrictions && checkIsParkingRestricted()) {
        return parkingRestrictionFailure();
      }

      $ionicLoading.show({
        template: '<div class="circle-loader"><span>Loading</span></div>'
      });
      $data.resources.bookings.endcheck({id: ctrl.booking.id}).$promise.then(function(carCheck) {
        if(carCheck.message) {
          $ionicLoading.hide();
          return submitFailure(carCheck.message);
        }

        var picsToSend = [];
        for (var picture in ctrl.pictures) {
          picsToSend.push(ctrl.pictures[picture]);
        }
        
        Reports.create({
          bookingId: $stateParams.id,
          description: null,
          files: picsToSend
        });
        goToEndRide();
      });
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

    function goToEndRide(byPass) {
      if (byPass) {
        ctrl.overrideStreetRestrictions = true;
      }
      var payload = {};
      //ZendriveService.stop();
      /*eslint-disable */
      var expireDay, expireHour, expireMins;
      if (!ctrl.isHub && !ctrl.isWaivePark && ctrl.type === 'street' && !ctrl.overrideStreetRestrictions) {
        if (!ctrl.street.streetHours) {
          return submitFailure('Please enter the expiration time for your parking or select that there is no restriction if there is none.');
        }
        var streetHours = ctrl.street.streetHours;
        var splitHours = streetHours.split(':');
        if ((Number(splitHours[0]) > 12 && ctrl.hourModifier !== 'fromNow') || (splitHours[1] && Number(splitHours[1]) > 59)) {
          return submitFailure('The time you have entered is invalid');
        }
        if (ctrl.hourModifier !== 'fromNow' && !ctrl.overrideStreetRestrictions) {
          expireDay = ctrl.street.streetDay >= 0 ? ctrl.street.streetDay : (ctrl.street.streetDay === -2 ? (new Date()).getDay() : (new Date()).getDay() + 1) 
          var hours = Number(splitHours[0]);
          if (hours === 12 && ctrl.hourModifier === 'am') {
            hours = 0;
          }
          expireHour = ctrl.hourModifier === 'am' || hours === 12 ? hours : hours + 12;
          expireMins = splitHours[1] ? Number(splitHours[1]) : 0;
          var nextDate = moment().day(expireDay >= (new Date()).getDay() ? expireDay : 7 + expireDay);
          nextDate.hour(expireHour);
          nextDate.minute(expireMins);
          streetHours = nextDate.diff(moment(), 'hours')
        } else {
          var expiration = moment().add(Number(splitHours[0]), 'hours').add(Number(splitHours[1]), 'minutes');
          expireDay = expiration.day();
          expireHour = expiration.hours();
          expireMins = expiration.minutes();
          streetHours = expiration.diff(moment(), 'hours');
        }
        if (streetHours < ctrl.minhours) return submitFailure('You can\'t return your WaiveCar here. The spot needs to be valid for at least ' + ctrl.minhours + ' hours.');
        payload = Object.assign({}, ctrl.street);
      }
      if (ctrl.overrideStreetRestrictions) {
        payload.nosign = true;
      }
      if (!ctrl.street.streetSignImage) {
        payload.nophoto = true;
      }
      payload.expireHour = expireHour;
      payload.expireDay = expireDay;
      payload.expireMins = expireMins;
      delete payload.streetHours;
      delete payload.streetMinutes;
      delete payload.steetDay;
      payload.type = ctrl.type;
      $ride.setParkingDetails(payload);
      return $ride.processEndRide().then(function () {
        $ionicLoading.hide();
        return $ride.checkAndProcessActionOnBookingEnd();
      });
    }

    function skipToEnd() {
      if (ctrl.street.streetSignImage || ctrl.isHub || ctrl.isWaivePark) {
        return $ride.processEndRide().then(function () {
          $ionicLoading.hide();
          return $ride.checkAndProcessActionOnBookingEnd();
        });
      }
      if(!ctrl.isHub && ctrl.type === 'street' && !ctrl.street.streetSignImage) {
        submitFailure('Ending here requires a photo of the parking sign.');
      }
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
