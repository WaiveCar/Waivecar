'use strict';
var angular = require('angular');
var moment = require('moment');
require('angular-ui-router');
require('../services/auth-service');

module.exports = angular.module('app.controllers').controller('BookingsController', [
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($scope, $state, $auth, $data) {

    $scope.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $scope.rides = [];
      $scope.limit = 5;
      $scope.offset = 0;
      $scope.moreBtn = true;

      $scope.getPastRides($scope.offset, function(data){
        $scope.rides = data;
        $scope.offset++;
        console.log('rides: ', data);
      });
    };

    $scope.getMoreRides = function(){
      $scope.getPastRides($scope.offset, function(data){
        if (!data.length){
          $scope.moreBtn = false;
        }
        for (var i=0; i<data.length; i++){
          $scope.rides.push(data[i]);
        }
        $scope.offset++;
      });
    };

    $scope.getPastRides = function(step, cb){
      $data.resources.bookings.getPastRides({
        userId: $auth.me.id,
        offset: step * $scope.limit,
        limit: $scope.limit
      }).$promise.then(function(data){
        var arr = data.map(function(item){
          var isFailed = item.payments.filter(function(val){
            return val.status === 'failed';
          }).length;
          var className = ['ride-row'];
          item.dateHeader = moment(item.createdAt).format('MMMM D, YYYY');

          var ride = {
            start: item.details.find(function(val){
              return val.type === 'start';
            }),
            end: item.details.find(function(val){
              return val.type === 'end';
            }),
            fee: item.payments.reduce(function(value, payment){
              return value + (payment.amount - payment.refunded);
            }, 0) / 100,
            locations: item.carPath,
            id: item.id
          };

          item.hourFooter = moment(ride.start.createdAt).format('LT') + ' - ' + moment(ride.end.createdAt).format('LT');
          item.startTime = moment(ride.start.createdAt).format('LT');
          item.endTime = moment(ride.end.createdAt).format('LT');
          if(ride.fee) {
            ride.fee = '$' + ride.fee.toFixed(2);
          } else {
            ride.fee = 'FREE';
          }

          var duration = moment.duration(moment((ride.end || {}).createdAt).diff(moment((ride.start || {}).createdAt)));
          ride.duration = {
            raw: duration,
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds()
          };

          if(isFailed) {
            className.push('failed-row');
            ride.failed = true;
          }

          item.route = false;
          if (ride.start && ride.end){
            item.route = {
              start: {
                longitude: ride.start.longitude,
                latitude: ride.start.latitude
              },
              destiny: {
                longitude: ride.end.longitude,
                latitude: ride.end.latitude
              },
              fitBoundsByRoute: true,
              intermediatePoints: ride.locations
            };
          }

          item.ride = ride;

          return item;
        });
        cb(arr);
      });
    };

    $scope.init();

  }
]);
