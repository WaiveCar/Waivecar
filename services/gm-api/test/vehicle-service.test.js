/*
  User Module Tests
  =================
  @author Christoffer Rødvik
  @github https://github.com/kodemon/reach-api
 */

'use strict';

// ### Dependencies

let assert         = require('chai').assert;
let VehicleService = Reach.service('gm-api/vehicle-service');

// ### Mocks

let mockVehicles = {
  chevVolt : {
    vin : '1G1RD6E44CU000002'
  }
};

// ### Unit Tests

describe.skip('GM API > vehicle-service', function () {
  this.timeout(30000);

  let service = new VehicleService();

  describe('Login', function () {
    it('should log in on the gm api', function *() {
      let result = yield service.connect();
      assert.isDefined(result);
      assert.isString(result);
      assert.equal(result, service.getBearerToken());
    });

    describe('Tokens', function *() {
      it('Reuse the token if it\'s already received');
      it('Try to revalidate the token if it\'s about to be expired');
    });
  });

  describe('Vehicle Function', function () {
    it('should list available vehicles', function *() {
      let result = yield service.listVehicles();
      assert.isDefined(result);
      assert.isArray(result);
      assert.isAbove(result.length, 0);
    });

    it('should get vehicle data', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.getVehicleInfo(desiredVin);
      assert.isDefined(result);
      assert.isObject(result);
      assert.equal(result.vehicle.vin, desiredVin);
    });

    it('should get vehicle location', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.getVehicleLocation(desiredVin);
      assert.isDefined(result);
      assert.isObject(result);
    });

    it('should fetch vehicle diagnostics', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.getVehicleDiagnostics(desiredVin);
      assert.isDefined(result);
      assert.isObject(result);
      assert.isObject(result.evBatteryLevel);
      assert.isObject(result.evChargeState);
      assert.isObject(result.priorityChargeStatus);
      assert.isObject(result.estChgEnd120V);
      assert.isObject(result.estChgEnd240V);
      assert.isObject(result.estChgEnd400V);
      assert.isObject(result.fuelAmount);
      assert.isObject(result.fuelCapacity);
      assert.isObject(result.fuelLevel);
      assert.isObject(result.fuelLevelInGal);
      assert.isObject(result.odometer);
      assert.isObject(result.oilLife);
      assert.isObject(result.tirePressureLf);
      assert.isObject(result.tirePressureLr);
      assert.isObject(result.tirePressurePlacardFront);
      assert.isObject(result.tirePressurePlacardRear);
      assert.isObject(result.tirePressureRf);
      assert.isObject(result.tirePressureRr);
      assert.isObject(result.evRange);
      assert.isObject(result.totalRange);
    });

    it('should get vehicle capabilities', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.getVehicleCapabilities(desiredVin);
      assert.isDefined(result);
      assert.isDefined(result.vehicleCapabilities);
      assert.equal(result.vehicleCapabilities.vin, desiredVin);
    });

    it('should unlock doors', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.unlockDoor(desiredVin);
      assert.isDefined(result);
      assert.isTrue(result);
    });

    it('should lock doors', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.lockDoor(desiredVin);
      assert.isDefined(result);
      assert.isTrue(result);
    });

    it('should start the engine', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.startEngine(desiredVin);
      assert.isDefined(result);
      assert.isTrue(result);
    });

    it('should cancel starting the engine', function *() {
      let desiredVin = mockVehicles.chevVolt.vin;
      let result     = yield service.cancelStartEngine(desiredVin);
      assert.isDefined(result);
      assert.isTrue(result);
    });

    describe('Vehicle Alerts', function () {
      it('should honk', function *() {
        let desiredVin = mockVehicles.chevVolt.vin;
        let result     = yield service.honk(desiredVin);
        assert.isDefined(result);
        assert.isTrue(result);
      });

      it('should flash lights', function *() {
        let desiredVin = mockVehicles.chevVolt.vin;
        let result     = yield service.flash(desiredVin);
        assert.isDefined(result);
        assert.isTrue(result);
      });

      it('should honk and flash lights', function *() {
        let desiredVin = mockVehicles.chevVolt.vin;
        let result     = yield service.honkAndFlash(desiredVin);
        assert.isDefined(result);
        assert.isTrue(result);
      });

      it('should alert vehicle data', function *() {
        let desiredVin = mockVehicles.chevVolt.vin;
        let result     = yield service.vehicleData(desiredVin);
        assert.isDefined(result);
        assert.isTrue(result);
      });
    });
  });
});