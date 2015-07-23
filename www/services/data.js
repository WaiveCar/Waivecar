function DataService() {
  return {
    models: {},
    active: {}
  };
}

angular.module('app')
.factory('Data', [
  DataService
]);
