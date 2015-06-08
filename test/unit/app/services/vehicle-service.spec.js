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
                assert.fail();
            });
        });
        it.only('Unlock doors',function(){
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
    });



});