'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

function CreditCardController($injector, $stateParams, $scope, $state, $auth, $data, $message, $q, $modal, $timeout, cards){
  var $ionicHistory = $injector.get('$ionicHistory');

  this.submit = function(form){
    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    }

    return $q.resolve()
      .then(function(){
        if ($auth.me.stripeId) {
          return false;
        }

        return $data.resources.users.createCustomer({}, {
          userId: $scope.me.id,
          customer: {
            description: 'WaiveCar customer registered via app.'
          }
        }).$promise;
      })
      .then(function() {
        return $auth.reload();
      })
      .then(function() {
        var creditCard = angular.copy($scope.card);
        return creditCard.$save();
      })
      .then(function() {
        $modal('result', {
          icon: 'check-icon',
          title: 'Your payment method looks okay.'
        })
          .then(function (modal) {
            modal.show();
            return $timeout(2000).then(function () {
              modal.remove();
              if ($scope.fromBooking) {
                return $ionicHistory.goBack();
              }

              if ($scope.isWizard) {
                return $state.go('quiz-index', {step: 6});
              }

              $state.go('credit-cards');
            });
          });
      })
      .catch(function (err) {
        var modal;
        $modal('result', {
          icon: 'x-icon',
          title: 'Error adding your credit card',
          message: err.data.message,
          actions: [{
            className: 'button-balanced',
            text: 'Retry',
            handler: function () {
              modal.remove();
            }
          }]
        }).then(function (_modal) {
          modal = _modal;
          modal.show();
        });
      });
  };

  $scope.init = function() {
    $scope.isWizard = $stateParams.step;
    $scope.fromBooking = $stateParams.fromBooking;
    $scope.me = $auth.me;

    if (cards && Array.isArray(cards)) {
      if (cards.length) {
        $scope.card = cards[0];
      } else {
        $scope.card = new $data.resources.Card({
          userId: $scope.me.id,
          service: 'stripe',
          card: {}
        });
      }
    } else if (cards instanceof $data.resources.Card) {
      $scope.card = cards;
    }
  };

  $scope.init();
}

module.exports = angular.module('app.controllers')
  .controller('CreditCardController', [
    '$injector',
    '$stateParams',
    '$scope',
    '$state',
    '$auth',
    '$data',
    '$message',
    '$q',
    '$modal',
    '$timeout',
    'cards',
    CreditCardController
  ]);
