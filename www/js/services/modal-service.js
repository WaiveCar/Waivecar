'use strict';
var angular = require('angular');
require('ionic-angular');

function ModalFactory ($rootScope, $ionicModal) {
  return function $modalFactory (templateName, initialData) {
    var template = '/templates/modals/' + templateName + '.html';
    var scope = $rootScope.$new();
    if (initialData.icon) {
      if (!/\./.test(initialData.icon)) {
        initialData.icon = '/img/' + initialData.icon + '.svg';
      }
    }
    angular.extend(scope, initialData || {});

    return $ionicModal.fromTemplateUrl(template, {
      scope: scope,
      animation: initialData.animation || 'fade-in-up'
    })
    .then(function (modal) {
      scope.close = modal.hide.bind(modal);
      return modal;
    });
  };
}

module.exports = angular.module('app.services').service('$modal', [
  '$rootScope',
  '$ionicModal',
  ModalFactory
]);
