'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/contact-service');

module.exports = angular.module('app.controllers').controller('MessageController', [
  '$scope',
  '$state',
  'ContactService',
  function ($scope, $state, ContactService) {

    var ctrl = this;

    ctrl.init = init;
    ctrl.send = send;

    ctrl.init();

    function init() {}

    function send(subject, message) {
      ContactService.send(subject, message).$promise.then(function() {
        $state.go('messages-sent');
      });
    }

  }

]);
