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

    show: function(req, res, next) {
      var model = {};
      Model.findById(req.params.id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Vehicle could not be found for ' + req.params.id));

        //TODO: HACK TO NOT CALL GM API EVERY TIME. IMPLEMENT CACHING EXPIRATION TO KNOW WHEN TO REFRESH.
        if (model.diagnostics && model.capabilities && model.location) {
          return res.format({
            json: function() {
              res.json(model);
            }
          });
        }

        async.parallel([
          function(completeTask) {
            VehicleService.getVehicleInfo(model.vin, function(err, data) {
              _.extend(model, data.vehicle);
              return completeTask(err);
            });
          },
          function(completeTask) {
            VehicleService.getVehicleDiagnostics(model.vin, function(err, data) {
              model.diagnostics = data;
              return completeTask(err);
            });
          },
          // 403 error!?
          function(completeTask) {
            VehicleService.getVehicleLocation(model.vin, function(err, data) {
              console.log(err);
              console.log(data);
              model.location = data;
              return completeTask(err);
            });
          },
          function(completeTask) {
            VehicleService.getVehicleCapabilities(model.vin, function(err, data) {
              if (data && data.vehicleCapabilities) model.capabilities = data.vehicleCapabilities;
              return completeTask(err);
            });
          }
        ], function(err) {
          if (err) return next(err);
          model.save(function(dbErr) {
            if (dbErr) return next(dbErr);
            return res.format({
              json: function() {
                res.json(model);
              }
            });
          });
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
