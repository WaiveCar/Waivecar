'use strict';
var angular = require('angular');
require('./socket-service.js');
require('../resources/bookings.js');
require('../resources/cars.js');
require('../resources/locations.js');
require('../resources/users.js');
require('../resources/licenses.js');

require('../resources/card');
require('../resources/file');
require('../resources/auth');
require('../resources/user');
require('../resources/verification');
require('../resources/car');

var _ = require('lodash');

module.exports = angular.module('app.services').factory('$data', [
  '$rootScope',
  '$http',
  '$q',
  '$socket',
  'Bookings',
  'Cars',
  'Locations',
  'Users',
  'Licenses',

  'Card',
  'File',
  'Auth',
  'User',
  'Verification',
  function ($rootScope, $http, $q, $socket, Bookings, Cars, Locations, Users, Licenses, Card, File, Auth, User, Verification) {

    var service = {

      resources: {
        bookings: Bookings,
        cars: Cars,
        licenses: Licenses,
        locations: Locations,
        users: Users,

        Card: Card,
        File: File,
        Auth: Auth,
        User: User,
        Verification: Verification
      },

      me: void 0,
      userLocation: {},
      instances: {},
      active: {},
      isSubscribed: false,

      initialize: function (modelName) {
        service.instances[modelName] = [];
        return service.fetch(modelName, {});

      },

      fetch: function (modelName) {
        if (service.resources[modelName] == null) {
          return $q.reject('Model ' + modelName + ' unknown');
        }
        return service.resources[modelName].query().$promise
          .then(function (items) {
            service.mergeAll(modelName, items);
            return service.instances[modelName];
          });
      },

      create: function (modelName, data) {
        var instance = new service.resources[modelName](data);
        return instance.$save().then(function(model) {
          service.merge(modelName, model.toJSON());
          return service.activateKnownModel(modelName, model.id).then(function() {
            return model.toJSON();
          });
        });
      },

      update: function (modelName, data, next) {
        var instance = new service.resources[modelName](data);
        instance.$update(function (model) {
          service.merge(modelName, model.toJSON());
          return service.activateKnownModel(modelName, model.id, next);
          return next();
        }, function (error) {
          return next(error.data || error);
        });
      },

      remove: function (modelName, id) {
        return $q(function (resolve, reject) {
          service.resources[modelName].remove({
            id: id
          }, function () {
            service.purge(modelName, id);
            return resolve(id);
          }, function (error) {
            return reject(error.data || error);
          });
        });
      },

      createCreditCard: function (data, next) {
        var customer = {
          data: {
            metadata: {}
          }
        };

        service.resources.users.createCustomer(customer, function () {
          service.resources.users.createCard(data, next);
        });
      },

      removeCreditCard: function (data, next) {
        return next(null, data);
      },

      // client-side manipulation only
      mergeAll: function (modelName, instances) {
        _.each(instances, function (item) {
          var model = item.toJSON ? item.toJSON() : item;
          service.merge(modelName, model);
        });
      },

      // client-side manipulation only
      merge: function (modelName, model) {
        if (!model) {
          return null;
        }
        if (!service.instances[modelName]) {
          service.instances[modelName] = [];
        }
        var existing = service.getExisting(modelName, model.id);
        if (existing) {
          angular.extend(existing, model);
        } else {
          service.instances[modelName].push(model);
        }
        return model;
      },

      // client-side manipulation only
      purge: function (modelName, id) {
        if (service.active[modelName] && service.active[modelName].id.toString() === id.toString()) {
          service.deactivate(modelName);
        }

        var item = service.getExisting(modelName, id);
        if (item) {
          service.instances[modelName].splice(_.indexOf(service.instances[modelName], item), 1);
        }
      },

      // client-side manipulation only
      activateKnownModel: function (modelName, id) {
        return $q(function (resolve, reject) {

          var existing = service.getExisting(modelName, id);
          if (existing) {
            service.active[modelName] = existing;
            return resolve(service.active[modelName]);
          }

          return service.fetch(modelName, {})
            .then(function () {
              existing = service.getExisting(modelName, id);
              service.active[modelName] = existing;
              return resolve(service.active[modelName]);
            })
            .catch(reject);

        });

      },

      getExisting: function (modelName, id) {
        var existing = _.find(service.instances[modelName], function (m) {
          return m.id.toString() === id.toString();
        });

        return existing;
      },

      // client-side manipulations only
      activate: function (modelName, id) {

        if (service.instances[modelName]) {
          return service.activateKnownModel(modelName, id);
        }

        return service.initialize(modelName)
          .then(function () {
            return service.activateKnownModel(modelName, id);
          });

      },

      // client-side manipulations only
      deactivate: function (modelName) {
        delete service.active[modelName];

      },

      subscribe: function () {
        // $socket.emit('subscribe', {}, function (err) {
        //   if (err) {
        //     console.error('error', err);
        //   } else {
        //     service.isSubscribed = true;
        //   }
        // });
      },

      unsubscribe: function () {
        if (service.isSubscribed) {
          // $socket.emit('unsubscribe', {}, function (err) {
          //   if (err) {
          //     console.error('error', err);
          //   }
          //   service.isSubscribed = false;
          // });
        }
      }
    };

    // $rootScope.$on(mapsEvents.positionChanged, function(e, position) {
    //   service.userLocation = position;
    //   if (service.userLocation.latitude && service.userLocation.longitude) {
    //     service.fetch('cars', service.userLocation);
    //   }
    // });

    $socket.on('relay', function (resource, action) {
      var model = action.data;

      if (resource === 'users') {
        service.me = resource;
        return;
      }

      switch (action.type) {
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
      default:
        throw new Error('Undetermined socket relay action.type handler');
      }
    });

    return service;
  }

]);
