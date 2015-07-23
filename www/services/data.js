function DataService() {
  var svc = {

    models: {},

    active: {},

    activate: function(modelName, id, next) {
      if (!svc.models[modelName]) {
        return next(new Error('models not initialized for ' + modelName));
      }

      var singular = modelName.substr(0, modelName.length - 1);
      svc.active[singular] = _.findWhere(svc.models[modelName], { id: id });
      return next(null, svc.active[singular]);
    }

  };
  return svc;
}

angular.module('app')
.factory('Data', [
  DataService
]);
