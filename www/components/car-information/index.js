function carInformationDirective(searchEvents, $state) {
  function link(scope, element, attrs, ctrl) {
    if (!$state.params) {
      return;
    }
    var details = $state.params.vehicleDetails;
    scope.name = details.name;
    scope.plate = details.plate;
  }
  return {
    restrict: 'E',
    link: link,
    templateUrl: 'components/car-information/templates/index.html'
  }
}

angular.module('app')
.directive('carInformation', [
  'searchEvents',
  '$state',
  carInformationDirective
]);