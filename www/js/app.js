// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function() {
    function FleetService(){

    }
    FleetService.prototype.getNearbyFleet = function() {
      return [
 
        {latitude:40.76,longitude:-74.16,title:"[40.76,-74.16]","id":"0"},
        {latitude:41,longitude:-75,title:"[41,-75]",id:"1"},
        {latitude:40.76,longitude:-73.4,title:"[40.76,-73.4]",id:"2"},

      ]
    };
    function MapController($scope,fleetService,uiGmapGoogleMapApi){
      $scope.map = { center: { latitude: 40.74, longitude: -74.18 }, zoom: 9 };
      var self=this;
      $scope.fleetCars=[]; 
      uiGmapGoogleMapApi.then(function(maps) {
          $scope.fleetCars=fleetService.getNearbyFleet();
      });
    }
    angular.module('starter', ['ionic','uiGmapgoogle-maps'])
    .service('fleetService',['$rootScope',FleetService])
    .controller('waiveCar-mapCtrl',['$scope','fleetService','uiGmapGoogleMapApi',MapController])
    .directive('nearbyFleet', [function() {
                    return {
                      templateUrl:'/templates/nearbyFleet.html',
                      restrict: 'E',
                      scope:false
                    };
                  }]
    )
    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
      .config(function(uiGmapGoogleMapApiProvider) {
          uiGmapGoogleMapApiProvider.configure({
              //    key: 'your api key',
              v: '3.17',
              libraries: 'weather,geometry,visualization'
          });
      })

})();