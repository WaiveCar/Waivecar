'use strict';
var angular = require('angular');

var directive = ['$ionicModal', function ($ionicModal) {
  function link (scope, elem, attrs, ctrl) {
    scope.$on('$destroy', function () {
      ctrl.modal.remove();
    });

    if (attrs.autoShow) {
      ctrl.$promise.then(function () {
        ctrl.modal.show();
      });
    }
  }

  function ModalController ($scope) {
    var self = this;
    this.$promise = $ionicModal.fromTemplateUrl('/templates/directives/simple-modal.html', {
      scope: $scope,
      animation: 'fade-in-up'
    })
    .then(function (modal) {
      self.close = modal.remove.bind(modal);
      self.modal = modal;
    });

    if (this.actions) {
      this.actions.$promise = this.$promise;
      this.actions.show = this.$promise.then(function () {
        this.modal.show();
      }.bind(this));
    }

  }

  return {
    restrict: 'E',
    controller: ['$scope', ModalController],
    controllerAs: 'modal',
    template: 'templates/directives/modal.html',
    scope: true,
    link: link,
    bindToController: {
      title: '@',
      message: '@',
      actions: '='
    }
  };
}];

module.exports = angular.module('app.directives').directive('simpleModal', directive);
