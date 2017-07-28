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

      $scope.limit = 15;

      $scope.getPastRides(0, function(data){
        $scope.rides = data;
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
          item.hourFooter = moment(item.createdAt).format('LT');

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
            id: item.id
          };

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

          item.ride = ride;

          return item;
        });
        cb(arr);
      });
    };

    $scope.init();

  }
]);
