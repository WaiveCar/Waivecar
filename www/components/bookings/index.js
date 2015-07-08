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
    $state.go('search');
  };

  self.openMap = function() {
    // TODO: open map.
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