var _ = require('lodash');
var async = require('async');

exports = module.exports = function(Vehicle, VehiclesService, config, logger) {

  var svc = {

    concurrency: 10,

    process: function (job, next) {
      if (_.contains(config.jobs.skipProcessingIn, config.server.env)) {
        logger.debug('Vehicle Reconcile Fleet: Skipping Job');
        return next();
      }

      VehiclesService.listVehicles(function(err, vehicles) {
        if (err) {
          job.failed().error(err);
          return next(err);
        }

        async.each(vehicles, function(vehicle, completedTask) {
          Vehicle.findOne({ vin: vehicle.vin }).exec(function(err, found) {
            if (err) return completedTask(err);
            if (found) {
              _.merge(found, vehicle);
              return found.save(completedTask)
            } else {
              return Vehicle.create(vehicle, completedTask);
            }
          });
        }, function(updateErr) {
          if (updateErr) {
            job.failed().error(updateErr);
            return next(updateErr);
          }
          return next();
        });
      });
    }

  };

  return svc;
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/vehicle', 'services/vehicles-service', 'igloo/settings', 'igloo/logger' ];
