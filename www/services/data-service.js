function DataService($rootScope, Bookings, Cars, Locations, Users, mapEvents) {

  var service = {

    resources : {
      bookings  : Bookings,
      cars      : Cars,
      locations : Locations,
      users     : Users
    },

    userLocation : {},

    all : {},

    active : {},

    initialize : function(modelName, next) {
      service.all[modelName] = [];
      return service.fetch(modelName, {}, next);
    },

    fetch: function(modelName, filter, next) {
      // todo: add support for filter query params.
      var items = service.resources[modelName].query(function() {
        _.each(items, function(item) {
          var model = item.toJSON();
          service.merge(modelName, model);
        });
      });
    },

    create: function(modelName, data, next) {
      var instance = new service.resources[modelName](data);
      instance.$save(function(model) {
        service.merge(modelName, model.toJSON());
        service.activateKnownModel(modelName, model.id, next);
      });
    },

    update: function(modelName, data, next) {
      return next();
    },

    remove: function(modelName, id, next) {
      service.resources[modelName].remove(id);

      if (service.active[modelName] && service.active[modelName].id === id) {
        service.deactivate(modelName);
      }

      var item = _.findWhere(service.all[modelName], { id: id });
      if (item) {
        service.all[modelName].splice(_.indexOf(service.all[modelName], item), 1);
      }
      return next();
    },

    merge: function(modelName, model) {
      if (!model) return null;
      if (!service.all[modelName]) service.all[modelName] = [];

      var existing = _.findWhere(service.all[modelName], { id: model.id });
      if (existing) {
        _.merge(existing, model);
      } else {
        service.all[modelName].push(model);
      }

      return model;
    },

    activateKnownModel : function(modelName, id, next) {
      var existing = _.findWhere(service.all[modelName], { id: id });
      if (existing) {
        service.active[modelName] = existing;
        return next(null, service.active[modelName]);
      }

      service.fetch(modelName, {}, function(err) {
        service.active[modelName] = _.findWhere(service.all[modelName], { id: id });
        return next(null, service.active[modelName]);
      });
    },

    activate : function(modelName, id, next) {
      if (!service.all[modelName]) {
        service.initialize(modelName, function(err) {
          if (err) return next(err);
          service.activateKnownModel(modelName, id, next);
        });
      } else {
        service.activateKnownModel(modelName, id, next);
      }
    },

    deactivate: function(modelName, id) {
      delete service.active[modelName];
    }
  };

  $rootScope.$on(mapEvents.positionChanged, function(e, position) {
    console.log('refreshing cars');
    service.userLocation = position;
    if (service.userLocation.latitude && service.userLocation.longitude) {
      service.fetch('cars', service.userLocation);
    }
  });

  // this causes a lot of "not able to find your location" errors
  // via laptop at present.
  // locationService.init();
  return service;
}

angular.module('app')
.factory('DataService', [
  '$rootScope',
  'Bookings',
  'Cars',
  'Locations',
  'Users',
  'mapsEvents',
  DataService
]);
