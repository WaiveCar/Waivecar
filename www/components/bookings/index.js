function BookingController($rootScope, $scope, $state, Bookings,selectedCarService,mapsEvents,$ionicModal) {
  var self = this;

  this.selectedCarService=selectedCarService;

  self.isEdit = $state.params.id ? true : false;
  this.$state=$state;
  $scope.$on(mapsEvents.withinUnlockRadius,function(){
    // alert("RECEIVED WITHIN UNLOCK RADIUS");
    self.showDialog();

  });
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
  if(!selectedCarService.getSelected()){
    $state.go('cars');
  }
}
BookingController.prototype.cancelClick = function() {
   this.$state.go('cars');
};
BookingController.prototype.getSelectedCarDestiny = function() {
  var carDetails=this.selectedCarService.getSelected();
  if(!carDetails){
    return null;
  }
  return {
    latitude:carDetails.latitude,
    longitude:carDetails.longitude
  }
};
BookingController.prototype.getTimerDuration = function() {
  return  {'timeToCar': 15};
};

function BookingsController($rootScope, $scope, $state, Bookings) {
  var self = this;
  self.bookings = Bookings.query();
}

BookingController.prototype.dialogDisplay = function(fn) {
  // alert("DIALOG DISPLAY SET UP");
  this.showDialog=fn;
};


function dialogDirective(){
  return {
    restrict:'E',
    scope:{
      title:'@',
      subtitle:'@',
      buttonText:'@',
      setDisplayFunction: '&',
      setHideFunction: '&',
      onButtonClick:'&'
    },
    link: function(scope, element, attrs){
      // alert("ON LINK");
      scope.setDisplayFunction({'fn':function(){
            // alert("On set dísplay");
            // alert(element[0].firstChild);
            //             alert(element[0].firstChild.style);

        element[0].firstChild.style.display="block";
        // alert("Done");

      }});
      scope.setHideFunction({'fn':function(){
        element[0].firstChild.style.display="none";
      }});
    },
    templateUrl:'/components/bookings/templates/overlay-dialog.html'
  }
}
BookingController.prototype.dialogClick = function() {
  var selectedData=this.selectedCarService.getSelected();
  this.$state.go('cars-connect',{id:selectedData.id});
};
angular.module('app')
.controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  'Bookings',
  'selectedCar',
  'mapsEvents',
  '$ionicModal',
  BookingController
])
.controller('BookingsController', [
  '$rootScope',
  '$scope',
  '$state',
  'Bookings',
  BookingsController
])
.directive('connecting',dialogDirective);