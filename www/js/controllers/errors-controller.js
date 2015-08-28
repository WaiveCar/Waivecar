angular.module('app.controllers').controller('ErrorsController', [
  '$state',
  '$scope',
  function($scope, $state) {
    var messages = {
      'location-error'  : 'We were not able to find your location, please reconnect.',
      'unplugged-error' : 'It seems like you haven’t plugged the Waivecar in to charge.',
      'generic'         : 'We were unable to complete the current action. Please try again'
    }

    $scope.message = messages[$state.param.id]  ? messages[$state.param.id] : messages.generic;
  }
]);
