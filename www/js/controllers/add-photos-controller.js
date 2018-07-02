'use strict';
var angular = require('angular');

module.exports = angular.module('app.controllers').controller('AddPhotosController', ['$scope', function($scope) {
  var ctrl = this;
  ctrl.clicker = clicker;

  function clicker() {
    console.log('button clicked');
  }

}]).component('addPhotos', function(){
  return {
    templateUrl: '../../templates/bookings/add-photos.html'
  }
});
