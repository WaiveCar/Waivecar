'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').controller('MapController', [
  function () {
    // mapInstance is set from within the link function
    this.mapInstance = null;

  }
]);
