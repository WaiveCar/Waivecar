function DataService($rootScope, $http, $socket, Bookings, Cars, Locations, Users, mapsEvents) {

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

    isSubscribed: false,

    initialize : function(modelName, next) {
      service.all[modelName] = [];
      return service.fetch(modelName, {}, next);
    },

    fetch: function(modelName, filter, next) {
      // todo: add support for filter query params.
      var items = service.resources[modelName].query(function() {
        service.mergeAll(modelName, items);
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
      service.purge(modelName, id);
      return next();
    },

    createCreditCard: function(data, next) {
      var customer = {
        "data" : {
          "metadata" : {}
        }
      };

      service.resources.users.createCustomer(customer, function(err) {
        service.resources.users.createCard(data, next);
      });
    },

    removeCreditCard: function(data, next) {
      // TODO: $http.post('') // need endpoint
      return next(null, data);
    },

    createLicense: function(data, next) {
      // TODO: $http.post('') // need endpoint
      return next(null, data);
    },

    removeLicense: function(data, next) {
      // TODO: $http.post('') // need endpoint
      return next(null, data);
    },

    // client-side manipulation only
    mergeAll: function(modelName, models) {
      _.each(models, function(item) {
        var model = item.toJSON();
        service.merge(modelName, model);
      });
      if(modelName==='cars'){
        console.log('broadcasting');
        $rootScope.$broadcast(mapsEvents.markersChanged,'fleet');
      }
    },

    // client-side manipulation only
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

    // client-side manipulation only
    purge: function(modelName, id) {
      if (service.active[modelName] && service.active[modelName].id === id) {
        service.deactivate(modelName);
      }

      var item = _.findWhere(service.all[modelName], { id: id });
      if (item) {
        service.all[modelName].splice(_.indexOf(service.all[modelName], item), 1);
      }
    },

    // client-side manipulation only
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

    // client-side manipulations only
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

    // client-side manipulations only
    deactivate: function(modelName, next) {
      delete service.active[modelName];
      if (next && _.isFunction(next)) return next();
    },

    subscribe: function() {
      $socket.emit('subscribe', {}, function(err) {
        if (err) {
          console.error('error', err);
        } else {
          service.isSubscribed = true;
        }
      });
    },

    unsubscribe: function() {
      if (service.isSubscribed) {
        $socket.emit('unsubscribe', {}, function(err) {
          if (err) {
            console.error('error', err);
          }
          service.isSubscribed = false;
        });
      }
    }
  };

  $rootScope.$on(mapsEvents.positionChanged, function(e, position) {
    console.log('refreshing cars');
    service.userLocation = position;
    if (service.userLocation.latitude && service.userLocation.longitude) {
      service.fetch('cars', service.userLocation);
    }
  });

  $socket.on('flux', function(data) {
    var meta      = data.actionType.split(':');
    var modelName = meta[0];
    var action    = meta[1];
    var model     = data[modelName];

    // console.log([ modelName, action, model.id ].join(' '));
    switch(action) {
      case 'show':
      case 'stored':
      case 'updated':
        service.merge(modelName, model);
        break;
      case 'index':
        service.mergeAll(modelName, model);
        break;
      case 'deleted':
        service.purge(modelName, model);
        break;
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
  '$http',
  '$socket',
  'Bookings',
  'Cars',
  'Locations',
  'Users',
  'mapsEvents',
  DataService
]);
