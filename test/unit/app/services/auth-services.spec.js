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

var svc = IoC.create('services/auth-service');
var BlacklistedEmail = IoC.create('models/blacklisted-email');

describe('auth-service', function () {

  before(function () {
    BlacklistedEmail.remove({}).exec(function (err, res) {
      //Clear blacklist model for tests
    });
  });

  it('blacklists an email', function (done) {
    BlacklistedEmail.create({ email: 'test@test.com' }, function(err) {
      if (err) return done(err);
      done();
    });
  });

  it('checks if blacklisted email is blacklisted', function (done) {
    svc.isEmailBlacklisted('test@test.com', function (err, res) {
      if (err) return done(err);
      expect(res).to.exist;
      expect(res).to.be.true;
      done();
    });
  });

  it('checks if not blacklisted email is blacklisted', function (done) {
    svc.isEmailBlacklisted('test2@test.com', function (err, res) {
      if (err) return done(err);
      expect(res).to.exist;
      expect(res).to.be.false;
      done();
    });
  });

});
