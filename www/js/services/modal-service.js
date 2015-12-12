'use strict';
var angular = require('angular');
require('ionic-angular');

function ModalFactory ($rootScope, $ionicModal) {
  function Modal (templateName, initialData) {
    if (!(this instanceof Modal)) {
      return new Modal(templateName, initialData);
    }
    var template = '/templates/modals/' + templateName + '.html';
    var scope = $rootScope.$new();
    if (initialData.icon) {
      if (!/\./.test(initialData.icon)) {
        initialData.icon = '/img/' + initialData.icon + '.svg';
      }
    }
    angular.extend(scope, initialData || {});

    this.$promise = $ionicModal.fromTemplateUrl(template, {
      scope: scope,
      animation: initialData.animation || 'fade-in-up'
    })
    .then(function (modal) {
      this.close = scope.close = modal.remove.bind(modal);
      return modal;
    }.bind(this));
  };
  return Modal;
}

module.exports = angular.module('app.services').service('$modal', [
  '$rootScope',
  '$ionicModal',
  ModalFactory
]);
