/* global window: false, L: true */
'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/mock-city-location-service.js');
require('../services/auth-service');
require('../services/data-service');
var _ = require('lodash');
var ionic = require('ionic');
var sprintf = require('sprintf-js').sprintf;

module.exports = angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  'MockLocationService',
  '$auth',
  '$data',
  '$message',
  'booking',
  function ($rootScope, $scope, $state, LocationService, $auth, $data, $message, booking) {

    $scope.showConnect = false;

    $scope.bookingDetail = function (type, detail) {
      var na = 'Unavailable';

      var bookingDetail = _.find($scope.booking.details, {
        type: type
      });

      if (bookingDetail) {
        return bookingDetail[detail];
      }

      return na;

    };


    $scope.distance = function () {
      var from = $scope.bookingDetail('start', 'odometer');
      var to = $scope.bookingDetail('end', 'odometer');
      if (from === 'Unavailable' || to === 'Unavailable') {
        return from;
      }

      if (from && to) {
        return (to - from) + ' miles';
      }

    };


    $scope.duration = function () {
      return {
        timeToCar: 15
      };

      // var from = $scope.bookingDetail('start', 'time');
      // var to = $scope.bookingDetail('end', 'time');
      // if (from === 'Unavailable' || to === 'Unavailable') {
      //   return from;
      // }

      // return moment(from).from(to, true);

    };


    $scope.connect = function () {
      $state.go('bookings-prepare', {
        id: $scope.booking.id
      });
    };


    $scope.getDirections = function () {

      LocationService.getLocation()
        .then(function(location){

          var url;
          var sprintfOptions = {
            startingLat: location.latitude,
            startingLon: location.longitude,
            targetLat: $scope.booking.car.latitude,
            targetLon: $scope.booking.car.longitude
          };

          if(ionic.Platform.isWebView()){

            url = [
              'comgooglemaps-x-callback://?',
              '&saddr=%(startingLat)s,%(startingLon)s',
              '&daddr=%(targetLat)s,%(targetLon)s',
              '&directionsmode=walking',
              '&x-success=WaiveCar://?resume=true',
              '&x-source=WaiveCar'
            ].join('');
            url = sprintf(url, sprintfOptions);

            window.open(encodeURI(url), '_system');

          } else {

            url = 'http://maps.google.com/maps?saddr=%(startingLat)s,%(startingLon)s&daddr=%(targetLat)s,%(targetLon)s&mode=walking';
            url = sprintf(url, sprintfOptions);
            window.open(url);

          }

        });


    };


    $scope.cancel = function () {
      $scope.booking.$remove()
        .then(function(){
          $message.success('Booking cancelled.');
          $state.go('cars');
        });

    };


    $scope.mockInRange = function () {
      LocationService.setLocation($scope.booking.car.location);
    };


    $scope.mockOutOfRange = function () {
      LocationService.mockLocation();
      $scope.watchForWithinRange();

    };


    $scope.watchForWithinRange = function () {
      $scope.showConnect = false;

      var stopWatching = $scope.$watch(function () {

        var from = L.latLng($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude);
        var to = L.latLng($scope.booking.car.latitude, $scope.booking.car.longitude);
        var distance = from.distanceTo(to);
        return distance <= 25;

      }, function (newValue) {
        if (newValue) {
          stopWatching();
          $scope.showConnect = true;
          // we are now close enough to activate the car.
        }
      });

    };


    $scope.init = function () {

      $scope.booking = booking;

      // var _booking = angular.copy($scope.booking);
      // _booking.state = 'pending-arrival';
      // _booking.$save()
      //   .catch($message.error);

      $scope.watchForWithinRange();

    };

    $scope.init();

  }

]);
