angular.module('app.services').factory('$data', [
  '$rootScope',
  '$http',
  '$socket',
  'Bookings',
  'Cars',
  'Locations',
  'Users',
  'Licenses',
  function ($rootScope, $http, $socket, Bookings, Cars, Locations, Users, Licenses) {

    var service = {

      resources : {
        bookings  : Bookings,
        cars      : Cars,
        licenses  : Licenses,
        locations : Locations,
        users     : Users
      },

      me : undefined,

      userLocation : {},

      models : {},

      active : {},

      isSubscribed: false,

      initialize : function(modelName, next) {
        service.models[modelName] = [];
        return service.fetch(modelName, {}, next);
      },

      fetch: function(modelName, filter, next) {
        // todo: add support for filter query params.
        var items = service.resources[modelName].query(function() {
          service.mergeAll(modelName, items);
          if(typeof next =='function'){
              next();
          }
        });
      },

      create: function(modelName, data, next) {
        var instance = new service.resources[modelName](data);
        instance.$save(function(model) {
          service.merge(modelName, model.toJSON());
          service.activateKnownModel(modelName, model.id, next);
        }, function(error) {
          return next(error.data || error);
        });
      },

      update: function(modelName, data, next) {
        var instance = new service.resources[modelName](data);
        instance.$update(function(model) {
          service.merge(modelName, model.toJSON());
          service.activateKnownModel(modelName, model.id, next);
          return next();
        }, function(error) {
          return next(error.data || error);
        });
      },

      remove: function(modelName, id, next) {
        service.resources[modelName].remove({ id: id }, function(res) {
          service.purge(modelName, id);
        }, function(error) {
          return next(error.data || error);
        });
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
        return next(null, data);
      },

      // client-side manipulation only
      mergeAll: function(modelName, models) {
        _.each(models, function(item) {
          var model = item.toJSON ? item.toJSON() : item;
          service.merge(modelName, model);
        });
      },

      // client-side manipulation only
      merge: function(modelName, model) {
        if (!model) return null;
        if (!service.models[modelName]) service.models[modelName] = [];
        var existing = service.getExisting(modelName, model.id);
        if (existing) {
          angular.extend(existing, model);
        } else {
          service.models[modelName].push(model);
        }
        return model;
      },

      // client-side manipulation only
      purge: function(modelName, id) {
        if (service.active[modelName] && service.active[modelName].id.toString() === id.toString()) {
          service.deactivate(modelName);
        }

        var item = service.getExisting(modelName, id);
        if (item) {
          service.models[modelName].splice(_.indexOf(service.models[modelName], item), 1);
        }
      },

      // client-side manipulation only
      activateKnownModel : function(modelName, id, next) {
        var existing = service.getExisting(modelName, id);
        if (existing) {
          service.active[modelName] = existing;
          return next(null, service.active[modelName]);
        }

        service.fetch(modelName, {}, function(err) {
          var existing = service.getExisting(modelName, id);
          service.active[modelName] = existing;
          return next(null, service.active[modelName]);
        });
      },

      getExisting : function(modelName, id) {
        var existing = _.find(service.models[modelName], function(m) {
          return m.id.toString() === id.toString();
        });

        return existing;
      },

      // client-side manipulations only
      activate : function(modelName, id, next) {
        if (!service.models[modelName]) {
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

    // $rootScope.$on(mapsEvents.positionChanged, function(e, position) {
    //   service.userLocation = position;
    //   if (service.userLocation.latitude && service.userLocation.longitude) {
    //     service.fetch('cars', service.userLocation);
    //   }
    // });

    $socket.on('relay', function(resource, action) {
      var model = action[resource];

      if (resource === 'users') {
        console.log(resource);
        console.log(action);
        service.me = resource;
        return;
      }

      switch(action.type) {
        case 'show':
        case 'store':
        case 'update':
        case 'index':
          if (_.isArray(model)) {
            service.mergeAll(resource, model);
          } else {
            service.merge(resource, model);
          }
          break;
        case 'delete':
          service.purge(resource, model);
          break;
      }
    });

    // this causes a lot of "not able to find your location" errors
    // via laptop at present.
    // locationService.init();
    return service;
  }

]);
