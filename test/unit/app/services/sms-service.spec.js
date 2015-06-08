var fs = require('fs');
var assert = require('assert');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var async = require('async');
var IoC = require('electrolyte');
var path = require('path');

// change the working directory to the root directory
var basePath = process.cwd();

IoC.loader(IoC.node(path.join(basePath, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('lib', IoC.node(path.join(basePath, 'lib')));
IoC.loader('middleware', IoC.node(path.join(basePath, 'middleware')));
IoC.loader('controllers', IoC.node(path.join(basePath, 'app', 'controllers')));
IoC.loader('handlers', IoC.node(path.join(basePath, 'app', 'services', 'job-service', 'handlers')));
IoC.loader('models', IoC.node(path.join(basePath, 'app', 'models')));
IoC.loader('policies', IoC.node(path.join(basePath, 'app', 'policies')));
IoC.loader('services', IoC.node(path.join(basePath, 'app', 'services')));

var smsService = IoC.create('services/sms-service');
var config = IoC.create('igloo/settings');

var message = 'this is a message';

describe('sms-service', function() {

  describe('failed messages', function () {

    it('should fail on non existant number', function (done) {
      this.timeout(30000);
      smsService.message(undefined, message, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it ('should fail on invalid number', function (done) {
      this.timeout(30000);
      smsService.message('+15005550001', message, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it ('should fail on non-routeable number', function (done) {
      this.timeout(30000);
      smsService.message('+15005550002', message, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it ('should fail on blacklisted number number', function (done) {
      this.timeout(30000);
      smsService.message('+15005550004', message, function (err) {
        expect(err).to.exist;
        done();
      });
    });

    it ('should fail on non sms-capable number', function (done) {
      this.timeout(30000);
      smsService.message('+15005550009', message, function (err) {
        expect(err).to.exist;
        done();
      })
    });
  });

  describe('successful messages', function () {
    this.timeout(30000);
    it('Valid Number', function (done) {
      smsService.message('+14108675309', message, function (err) {
        console.log(err);
        expect(err).to.not.exist;
        done();
      })
    });
  });
});