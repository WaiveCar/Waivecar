function carChargeStatusDirective(searchEvents, $state) {
  function link(scope, element, attrs, ctrl) {
    if (!$state.params) {
      return;
    }

    var details = $state.params.vehicleDetails.status;
    scope.chargeLevel=details.charge.current + '% full';

    if (details.charge.charging) {
      scope.chargeState = 'Parked at charging station';
      scope.chargeLevel += ' - full in ' + details.charge.timeUntilFull + ' minutes';
    } else {
      scope.chargeState = 'Not charging';
    }

    scope.chargeReach = details.charge.reach + ' miles available on current charge';
  }

  return {
    restrict: 'E',
    link: link,
    templateUrl: 'components/car-charge-status/templates/index.html',
  }
}

angular.module('app')
.directive('carChargeStatus', [
  'searchEvents',
  '$state',
  carChargeStatusDirective
]);