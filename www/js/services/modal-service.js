'use strict';
var angular = require('angular');
require('ionic-angular');

function ModalService ($rootScope, $ionicModal) {
  var scope = $rootScope.$new();

  this.$promise = $ionicModal.fromTemplateUrl('/templates/directives/simple-modal.html', {
    scope: scope,
    animation: 'fade-in-up'
  })
  .then(function (modal) {
    this.close = modal.remove.bind(modal);
    this.modal = modal;
    this.show = modal.show.bind(modal);
  }.bind(this));

  this.setData = function setData (data) {
    angular.extend(scope, data);
  };
}

module.exports = angular.module('app.services').service('$modal', [
  '$rootScope',
  '$ionicModal',
  ModalService
]);
