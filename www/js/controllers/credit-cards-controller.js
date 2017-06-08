'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('CreditCardsController', [
  '$scope',
  '$data',
  '$message',
  '$auth',
  '$stateParams',
  '$ionicHistory',
  'IntercomService',
  function ($scope, $data, $message, $auth, $stateParams, $ionicHistory, IntercomService) {
    $scope.$ionicHistory = $ionicHistory;

    $scope.removeCreditCard = function (card, $index) {

      var cardNumber = card.card.number;
      return card.$delete()
        .then(function () {

          IntercomService.emitCreditCardEvent("removed", cardNumber);
          IntercomService.updateCardsInfo($auth.me);

          $scope.cards.splice($index, 1);
          $message.success('Card removed!');
        })
        .catch($message.error);

    };

    function init() {
      $scope.isWizard = $stateParams.hasOwnProperty('step');

      if(!$auth.me.stripeId){
        $scope.cards = [];
        return false;
      }

      $data.resources.Card.query({ userId: $auth.me.id }).$promise
        .then(function (cards) {
          $scope.cards = cards;
        })
        .catch($message.error);

    }

    init();

  }

]);
