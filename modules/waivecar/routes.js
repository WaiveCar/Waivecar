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