'use strict';

let Router         = Reach.Router;
let VehicleService = Reach.service('gm-api/vehicle-service');
let service        = new VehicleService();

Router.get('/cars/list', {
  handler : function *() {
    return yield service.listVehicles();
  }
});

Router.get('/cars/:vin/honk', {
  handler : function *(vin, query) {
    return yield service.honk(vin, query.duration);
  }
});

Router.get('/cars/:vin/vehicle-diagnostics', {
  handler : function *(vin) {
    return yield service.getVehicleDiagnostics(vin);
  }
});

Router.get('/cars/:vin/info', {
  handler : function *(vin) {
    return yield service.getVehicleInfo(vin);
  }
});

Router.get('/cars/:vin/vehicle-data', {
  handler : function *(vin) {
    return yield service.vehicleData(vin);
  }
});