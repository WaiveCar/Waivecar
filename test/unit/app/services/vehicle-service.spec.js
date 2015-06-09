var IoC = require('electrolyte');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var basePath = process.cwd();
var assert=chai.assert;

// IoC.loader(IoC.node(path.join(basePath, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('services', IoC.node(path.join(basePath, 'app', 'services')));

var mockVehicles={
    'chevVolt':{
        'vin':'1G1RD6E44CU000002'
    }
}
var vehicleService = IoC.create('services/vehicles-service');

describe('vehicle-service',function(){
    describe('Login',function(){
        it('Log in on the gm api',function(){
            this.timeout(0);
            var connect=vehicleService.connect();
            return connect.then(function(response){
                expect(response).to.exist;
                expect(response).to.equal(vehicleService.getBearerToken());
            })
            .catch(function(error){
                assert.fail();
            });
        });
        describe('Tokens',function(){
            it('Reuse the token if it\'s already received');
            it('Try to revalidate the token if it\'s about to be expired');
        });

    });
    describe('Vehicle functions',function(){
        it('List available vehicles',function(){
            this.timeout(0);
            return vehicleService.listVehicles().then(function(response){
                expect(response).to.exist;
                expect(response.vehicles).to.exist;
                expect(response.vehicles.size).to.be.above(0);
            })
            .catch(function(error){
                assert.fail();
            });
        });

        it("Get vehicle data",function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.getVehicleInfo(desiredVin).then(function(response){
                expect(response).to.exist;
                expect(response.vehicle.vin).to.equal(desiredVin);
            })
            .catch(function(error){
                assert.fail();
            });
        });
        //Receiving auth error for now,
        it.skip('Get vehicle location',function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.getVehicleLocation(desiredVin).then(function(response){
                expect(response).to.exist;
               //TOdo make deeper assertions when get response
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it.only('Fet vehicle diagnostics',function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.getVehicleDiagnostics(desiredVin).then(function(response){
                expect(response).to.exist;
                expect(response["EV BATTERY LEVEL"].unit).to.exist;
                expect(response["EV BATTERY LEVEL"].value).to.exist;
                expect(response["ODOMETER"].unit).to.exist;
                expect(response["ODOMETER"].value).to.exist;
                expect(response["EV CHARGE STATE"]["EV CHARGE STATE"].value).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL AMOUNT"].value).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL AMOUNT"].unit).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL CAPACITY"].value).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL CAPACITY"].unit).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL LEVEL"].value).to.exist;
                expect(response["FUEL TANK INFO"]["FUEL LEVEL"].unit).to.exist;
                expect(response["OIL LIFE"].unit).to.exist;
                expect(response["OIL LIFE"].value).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE LF"].value).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE LF"].unit).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE LR"].value).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE LR"].unit).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE RR"].value).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE RR"].unit).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE RF"].value).to.exist;
                expect(response["TIRE PRESSURE"]["TIRE PRESSURE RF"].unit).to.exist;
                expect(response["VEHICLE RANGE"]["EV RANGE"].value).to.exist;
                expect(response["VEHICLE RANGE"]["EV RANGE"].unit).to.exist;
                expect(response["VEHICLE RANGE"]["TOTAL RANGE"].value).to.exist;
                expect(response["VEHICLE RANGE"]["TOTAL RANGE"].unit).to.exist;
    

            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it('Get vehicle capabilities',function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.getVehicleCapabilities(desiredVin).then(function(response){
                expect(response).to.exist;
                expect(response.vehicleCapabilities).to.exist;
                expect(response.vehicleCapabilities.vin).to.equal(desiredVin);
                //TODO make deeper comparison?
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it('Unlock doors',function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.unlockDoor(desiredVin).then(function(response){
                 expect(response).to.exist;
                 expect(response).to.be.true;
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it("Lock doors",function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.lockDoor(desiredVin).then(function(response){
                 expect(response).to.exist;
                 expect(response).to.be.true;
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it("Starts the engine",function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.startEngine(desiredVin).then(function(response){
                 expect(response).to.exist;
                 expect(response).to.be.true;
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        it("Cancels start the engine command",function(){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            return vehicleService.cancelStartEngine(desiredVin).then(function(response){
                 expect(response).to.exist;
                 expect(response).to.be.true;
            })
            .catch(function(error){
                console.log(error);
                assert.fail();
            });
        });
        describe('Vehicle alerts',function(){
            it('Honks',function(){
                 this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                return vehicleService.honk(desiredVin).then(function(response){
                     expect(response).to.exist;
                     expect(response).to.be.true;
                })
                .catch(function(error){
                    console.log(error);
                    assert.fail();
                });
            });
            it('Flashes',function(){
                 this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                return vehicleService.flash(desiredVin).then(function(response){
                     expect(response).to.exist;
                     expect(response).to.be.true;
                })
                .catch(function(error){
                    console.log(error);
                    assert.fail();
                });
            });
            it('Honks and flashes',function(){
                 this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                return vehicleService.honkAndFlash(desiredVin).then(function(response){
                     expect(response).to.exist;
                     expect(response).to.be.true;
                })
                .catch(function(error){
                    console.log(error);
                    assert.fail();
                });
            });
        });
    });



});