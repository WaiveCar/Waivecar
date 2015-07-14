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
    var url= [
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
]);