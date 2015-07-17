function BookingController($rootScope, $scope, $state, Bookings) {
  var self = this;

  self.isEdit = $state.params.id ? true : false;

  if (self.isEdit) {
    self.booking = Bookings.get({ id: $state.params.id });
  } else {

  }

  self.createBooking = function() {
    // TODO: actual API calls.
    // Bookings.save({ vehicle: })
    $state.go('bookings-edit', { id: 1 });
  };

  self.updateBooking = function() {
    // TODO: actual API calls.
    $state.go('bookings-show', { id: 1 });
  };

  self.cancelBooking = function() {
    // TODO: actual API calls.
    $state.go('cars');
  };

  self.openMap = function() {
    // TODO: use actual address.
    var url = [
      'comgooglemaps-x-callback://?',
      '&daddr=International+Airport',
      '&directionsmode=walking',
      '&x-success=WaiveCar://?resume=true',
      '&x-source=WaiveCar'
    ].join('');
    window.open(encodeURI(url), '_system');
  };
}

function BookingsController($rootScope, $scope, $state, Bookings) {
  var self = this;
  self.bookings = Bookings.query();
}


function timeToGetToCarDirective(searchEvents, $state) {
  function link(scope, element, attrs, ctrl) {
    var durations = {'timeToCar': 15};
    ctrl.createTimer('getToWaiveCar', durations);
    ctrl.start();
    var watchExpressions = [
      function() {
        return ctrl.seconds;
      },
      function() {
        return ctrl.minutes;
      },
      function() {
        return ctrl.seconds;
      }
    ];
    scope.$watchGroup(watchExpressions, function(newValues, oldValues, scope) {
      if (typeof ctrl.hours != 'undefined' && ctrl.hours > 0) {
        scope.timeLeftDisplay = ctrl.hours + ':' + ctrl.minutes + ' hours left';
      }      else if (typeof ctrl.minutes != 'undefined' && ctrl.minutes > 0) {
        scope.timeLeftDisplay = ctrl.minutes + ':' + ctrl.seconds + ' minutes left';
      }      else if (typeof ctrl.seconds != 'undefined' && ctrl.seconds > 0) {
        scope.timeLeftDisplay = ctrl.seconds + ' seconds left';
      }      else {
        scope.timeLeftDisplay = 'no time left';

      }
    });

  }
  return {
      restrict: 'E',
      templateUrl: 'components/bookings/templates/directives/timeToGetToCar.html',
      link: link,
      controller: 'TimerController',
      controllerAs: 'timer'
    }

}

angular.module('app')
.controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  'Bookings',
  BookingController
])
.controller('BookingsController', [
  '$rootScope',
  '$scope',
  '$state',
  'Bookings',
  BookingsController
])
.directive('timeToGetToCar', [
  'searchEvents',
  '$state',
  timeToGetToCarDirective
]);