'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('InfoController', [
  '$scope',
  '$state',
  '$data',
  function ($scope, $state, $data) {
    this.isLevel = $data.me.hasTag('level');
  }
]);
