var IoC = require('electrolyte');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var basePath = process.cwd();
var assert=chai.assert;
var request = require('supertest');

IoC.loader('igloo', require('igloo'));
IoC.loader('services', IoC.node(path.join(basePath, 'app', 'services')));
IoC.loader(IoC.node(path.join(basePath, 'boot')));
IoC.loader('support',IoC.node(path.join(basePath, 'test','support')));

var fixtures=require(path.join(basePath,'test','fixtures','stripe.js'));
var stripeEventsFixture={stripeEvents:require(path.join(basePath,'test','fixtures','dataBase','stripeEvents'))};

var paymentService = IoC.create('services/payment-service');
var mongoFixtures= IoC.create('support/mongoFixtures');

function createCustomer(cardNumber,cb){
    var date=new Date();
    var cardData={
        number: cardNumber,
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
    var customerData = {
          description: description,
          email: email,
          card: cardData
    };
    paymentService.createCustomer(customerData,cb);
}
describe('payment-service',function(){
    describe('Setup',function(){
    });
    describe('Customer',function(){
        it('Creates a customer',function(done){
            this.timeout(5000);
            var cardNumber=fixtures.cards.successfull.Visa.number;
            var date=new Date();
            var cardData={
                number: cardNumber,
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
           var customerData = {
                description: description,
                email: email,
                card: cardData
            };
            paymentService.createCustomer(customerData,function(err,data){
                expect(err).to.not.exist;
                expect(data.id).to.exist;
                done();
            });
        });
        it('Updates a customer',function(done){
                this.timeout(5000);
                createCustomer(fixtures.cards.successfull.Visa.number,function(err,data){
                    expect(err).to.not.exist;
                    var customerId=data.id;
                    paymentService.updateCustomer(customerId,{description:'some new description'},function(err,data){
                        console.log(err);
                        expect(err).to.not.exist;
                        expect(data.id).to.exist;
                        done()
                    });
                });
        });
    });
    describe('Authorize and capture',function(){
        var customer;
        var customerThatFails;
        before(function(done){
             this.timeout(5000);
            createCustomer(fixtures.cards.successfull.Visa.number,function(err,data){
                if (err) {
                    done(err);
                }
                customer=data;
                createCustomer(fixtures.cards.specifc.AttemptsToChargeCustomerFail.number,function(err,data){
                    if (err) {
                        done(err);
                    }
                    customerThatFails=data;
                    done();
                });
            })
        });
        it('Authorizes a payment',function(done){
            this.timeout(5000);
            var description='Test authorize ';
            paymentService.authorizePayment(1000,customer.id,description,function(err,data){
              expect(err).to.not.exist;
              expect(data.id).to.exist;
              done();
            });
        });
        it('Captures a previously authorized payment',function(done){
            this.timeout(5000);
            var description='Test authorize and capture';
            var amount=1000;
            paymentService.authorizePayment(1000,customer.id,description,function(err,data){
              expect(err).to.not.exist;
              paymentService.capturePayment(amount,data.id,function(err,data){
                  expect(err).to.not.exist;
                  done();
              })    
            });
        });
        it('Fails to capture a incorrect card',function(done){
            this.timeout(5000);
            var description='Test authorize and capture';
            var amount=1000;
            paymentService.authorizePayment(1000,customerThatFails.id,description,function(err,data){
                expect(err).to.exist;
                done();
            });
        });
    });
    describe('Balance',function(){
        it("Retrive balance",function(done){
            this.timeout(5000);
            paymentService.retrieveBalance(function(err,data){
                expect(err).to.not.exist;
                done();
            })
        })
    });
    describe('Cards',function(){
        it('Deletes a user card',function(done){
            this.timeout(5000);
            createCustomer(fixtures.cards.successfull.Visa.number,function(err,data){
                    expect(err).to.not.exist;
                    var cardId=data.sources.data[0].id;
                    var customerId=data.id;
                    paymentService.deleteCard(customerId,cardId,function(err,data){
                        expect(err).to.not.exist;
                        done();
                    })
            });
        });
    });
    describe('WebHooks',function(){
        var app;
        var agent;
        before(function(done){
            this.timeout(5000);
            mongoFixtures.connect(done);
        })
        beforeEach(function(done){
            this.timeout(5000);
            mongoFixtures.clearAndLoad(stripeEventsFixture,function(err){
                if(err){
                    done(err);
                    return;
                }
                app = require(path.join(basePath, 'app'));
                agent = request.agent(app);
                done();
            });
        });
        it.only('Calls a webHook on the url',function(done){
            this.timeout(5000);
             var eventData={'foo':'bar'};
             agent.post('/v1/paymentWebHooks//')
                .set('Accept', 'application/json')
                .send(eventData)
                .expect(200)
                .end(function(err,data){
                    if(err){
                        done(err);
                        return;
                    }
                    expect(data.body.id).to.exist;
                    done();
                });
        });
        after(function(done){
            mongoFixtures.close(done);
        });
    });
});