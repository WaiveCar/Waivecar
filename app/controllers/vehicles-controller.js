var path = require('path');
var _ = require('lodash');
var async = require('async');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(Model, VehicleService, Setting, config) {
  var methods = {
    meta: {
      config: config,
      controllerName: 'vehicles',
      model: Model,
      modelName: 'vehicle'
    },

    index: function(req, res, next) {
      VehicleService.listVehicles(function(err, data) {
        if (err) return next(err);

        _.each(data.vehicles.vehicle, function(v) {
          v.id = v.vin;
        });

        return res.format({
          json: function() {
            res.json({
              object: 'list',
              has_more: false,
              pageCount: 1,
              itemCount: parseInt(data.vehicles.size),
              data: data.vehicles.vehicle
            });
          }
        });
      });
    },

    show: function(req, res, next) {
      var model = {};
      async.parallel([
        function(completeTask) {
          VehicleService.getVehicleInfo(req.params.id, function(err, data) {
            _.extend(model, data.vehicle);
            model.id = model.vin;
            return completeTask(err);
          });
        },
        function(completeTask) {
          VehicleService.getVehicleDiagnostics(req.params.id, function(err, data) {
            model.diagnostics = data;
            return completeTask(err);
          });
        },
        // 403 error!?
        // function(completeTask) {
        //   VehicleService.getVehicleLocation(req.params.id, function(err, data) {
        //     model.location = data;
        //     return completeTask(err);
        //   });
        // },
        function(completeTask) {
          VehicleService.getVehicleCapabilities(req.params.id, function(err, data) {
            model.capabilities = data;
            return completeTask(err);
          });
        }
      ], function(err) {
        if (err) return next(err);

        return res.format({
          json: function() {
            res.json(model);
          }
        });
      });
    },

    beforeUpdate: function(model, req, res, next) {
      _.extend(model, req.body);
      model.name = req.body.name || model.name;
      model.email = req.body.email || model.email;
      return next(null, model);
    },

    executeCommand: function(req, res, next) {
      if (!req.params.id) return next(new Error('required params missing'));

      var command = '';
      switch(req.params.command) {
        case 'start': {
          command = 'startEngine';
          break;
        }
        case 'stop': {
          command = 'cancelStartEngine';
          break;
        }
        case 'lock': {
          command = 'lockDoor';
          break;
        }
        case 'unlock': {
          command = 'unlockDoor';
          break;
        }
        default: {
          return next(new Error('required command param was not provided.'));
        }
      }

      VehicleService[command](req.params.id, function(err, data) {
        if (err) return next(err);

        return res.format({
          json: function() {
            res.json(data);
          }
        });
      });
    }

  };

  return _.merge(new Blueprint(methods.meta), methods);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/vehicle', 'services/vehicles-service', 'models/setting', 'igloo/settings' ];
