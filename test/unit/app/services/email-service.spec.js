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

var emailService = IoC.create('services/email-service');
var config = IoC.create('igloo/settings');

describe('email-service test', function () {

  before(function () {
  });

  it('sends an email through mandrill', function (done) {
    this.timeout(40000);
    emailService.send('test@test.test', 'welcome', {
      subject: 'Test email',
      username: 'Test user',
      settings: config.defaults
    }, function (err) {
      expect(err).to.not.exist;
      done();
    });
  });

});
