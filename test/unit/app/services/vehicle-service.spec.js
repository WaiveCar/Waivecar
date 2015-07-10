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
        it('Log in on the gm api',function(done){
            this.timeout(0);
            vehicleService.connect(function(err,response){
                expect(err).to.not.exist;
                expect(response).to.exist;
                expect(response).to.equal(vehicleService.getBearerToken());
                done();
            })
        });
        describe('Tokens',function(){
            it('Reuse the token if it\'s already received');
            it('Try to revalidate the token if it\'s about to be expired');
        });

    });
    describe('Vehicle functions',function(done){
        it('List available vehicles',function(done){
            this.timeout(0);
            vehicleService.listVehicles(function(err,response){
                expect(err).to.not.exist;
                expect(response).to.exist;
                expect(response.length).to.be.above(0);
                done();
            });

        });

        it("Get vehicle data",function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.getVehicleInfo(desiredVin,function(err,response){
                expect(err).to.not.exist;
                expect(response).to.exist;
                expect(response.vehicle.vin).to.equal(desiredVin);
                done();
            });
        });
        //Receiving auth error for now,
        it('Get vehicle location',function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.getVehicleLocation(desiredVin,function(err,response){
                expect(err).to.not.exist;
                expect(response).to.exist;
                done();
               //TOdo make deeper assertions when get response
            });
        });
        // refactor to use camelCasing
        it.skip('Fetch vehicle diagnostics',function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.getVehicleDiagnostics(desiredVin,function(error,response){
                expect(error).to.not.exist;
                expect(response).to.exist;
                expect(response["evBatteryLevel"].unit).to.exist;
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

                done();
            });
        });
        it('Get vehicle capabilities',function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.getVehicleCapabilities(desiredVin,function(err,response){
                expect(err).to.not.exist;
                expect(response).to.exist;
                expect(response.vehicleCapabilities).to.exist;
                expect(response.vehicleCapabilities.vin).to.equal(desiredVin);
                //TODO make deeper comparison?
                done();
            });
        });
        it('Unlock doors',function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.unlockDoor(desiredVin,function(err,response){
                 expect(err).to.not.exist;
                 expect(response).to.exist;
                 expect(response).to.be.true;
                 done();
            });
        });
        it("Lock doors",function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.lockDoor(desiredVin,function(err,response){
                 expect(err).to.not.exist;
                 expect(response).to.exist;
                 expect(response).to.be.true;
                 done();
            });
        });
        it("Starts the engine",function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.startEngine(desiredVin,function(err,response){
                 expect(err).to.not.exist;
                 expect(response).to.exist;
                 expect(response).to.be.true;
                 done();
            });
        });
        it("Cancels start the engine command",function(done){
            this.timeout(0);
            var desiredVin=mockVehicles.chevVolt.vin;
            vehicleService.cancelStartEngine(desiredVin,function(err,response){
                 expect(err).to.not.exist;
                 expect(response).to.exist;
                 expect(response).to.be.true;
                 done();
            });
        });
        describe('Vehicle alerts',function(){
            it('Honks',function(done){
                this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                vehicleService.honk(desiredVin,function(err,response){
                    expect(err).to.not.exist;
                    expect(response).to.exist;
                    expect(response).to.be.true;
                    done();
                });
            });
            it('Flashes',function(done){
                this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                vehicleService.flash(desiredVin,function(err,response){
                    expect(err).to.not.exist;
                    expect(response).to.exist;
                    expect(response).to.be.true;
                    done();
                });
            });
            it('Honks and flashes',function(done){
                this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                vehicleService.honkAndFlash(desiredVin,function(err,response){
                    expect(err).to.not.exist;
                    expect(response).to.exist;
                    expect(response).to.be.true;
                    done();
                });
            });
            it('Vehicle data',function(done){
                this.timeout(0);
                var desiredVin=mockVehicles.chevVolt.vin;
                vehicleService.vehicleData(desiredVin,function(err,response){
                    expect(err).to.not.exist;
                    expect(response).to.exist;
                    expect(response).to.be.true;
                    done();
                });
            });
        });
    });
});