'use strict';
var angular = require('angular');
require('ionic-angular');

function ModalFactory ($rootScope, $ionicModal, $sce) {
  return function $modalFactory (templateName, initialData) {
    initialData = initialData || {};
    var template = '/templates/modals/' + templateName + '.html';
    var scope = $rootScope.$new();
    if (initialData.icon) {
      if (!/\./.test(initialData.icon)) {
        initialData.icon = '/img/' + initialData.icon + '.svg';
      }
    }

    angular.extend(scope, initialData);
    if (scope.message) {
      scope.message = $sce.trustAsHtml(scope.message);
    }

    scope.toggleCheck = function() {
      scope.extendAlways = !scope.extendAlways;
    }

    return $ionicModal.fromTemplateUrl(template, {
      scope: scope,
      animation: initialData.animation || 'fade-in-up'
    })
    .then(function (modal) {
      scope.close = function() {
        if (initialData.close) {
          initialData.close();
        }
        modal.remove();
        modal.remove.bind(modal);
      };
      return modal;
    });
  };
}

module.exports = angular.module('app.services').service('$modal', [
  '$rootScope',
  '$ionicModal',
  '$sce',
  ModalFactory
]);
