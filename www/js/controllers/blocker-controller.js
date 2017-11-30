'use strict';
var angular = require('angular');

function BlockerController($injector, $scope, $data){

  var ctrl = this;
  var $sce = $injector.get('$sce');
  var $window = $injector.get('$window');
  var $state = $injector.get('$state');

  ctrl.init = function(){
    this.url = $sce.trustAsResourceUrl($state.params.url);
    this.title = $state.params.title;
  };

  ctrl.init();

}

module.exports = angular.module('app.controllers')
  .controller('BlockerController', [
    '$injector',
    '$scope',
    '$data',
    BlockerController
  ]);
