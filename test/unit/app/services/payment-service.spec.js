var IoC = require('electrolyte');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var basePath = process.cwd();
var assert=chai.assert;

// IoC.loader(IoC.node(path.join(basePath, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('services', IoC.node(path.join(basePath, 'app', 'services')));
var fixtures=require(path.join(basePath,'test','fixtures','stripe.js'));
var paymentService = IoC.create('services/payment-service');

function createCustomer(cb){
    var date=new Date();
    var cardData={
        number: fixtures.cards.successfull.Visa.number,
        exp_month: '5',
        exp_year: date.getFullYear()+1,
        cvc: 123,
        name: 'Some name',
        address_line1: 'Some address',
        address_line2: 'Another address',
        address_city: 'San Francisco',
        address_zip: 94102,
        address_state: 'California',
        address_country: 'US'
    }
    var description='description';
    var email='email@email.com';
    paymentService.createCustomer(description,email,cardData,cb);
}
describe.only('payment-service',function(){
    describe('Setup',function(){
    });
    describe('Customer',function(){
        it('Creates a customer',function(done){
            this.timeout(0);
            createCustomer(function(err,data){
                expect(err).to.not.exist;
                expect(data.id).to.exist;
                done();
            });
        });
    });
    describe('Authorize and capture',function(){
        var customer;
        before(function(done){
            createCustomer(function(err,data){
                if (err) {
                    done(err);
                }
                customer=data;
                done();
            })
        });
        it('Should authorize a payment',function(done){
            this.timeout(0);
            var description='Test authorize ';
            paymentService.authorizePayment(1000,customer.id,description,function(err,data){
              expect(err).to.not.exist;
              expect(data.id).to.exist;
              done();
            });
        });
    });
});