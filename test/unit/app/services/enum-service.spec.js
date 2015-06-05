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

var enumService = IoC.create('services/enum-service');

describe('enum-service tests', function() {
  it ('get media types', function (done) {
    var mediaTypes = enumService.getMediaTypes();
    expect(mediaTypes).to.be.a('Array');
    expect(mediaTypes.length).to.equal(4);
    mediaTypes.forEach(function (mediaType) {
      expect(mediaType).to.include.keys('name')
      expect(mediaType).to.include.keys('description');
      expect(mediaType).to.include.keys('icon');
    });
    mediaTypes[0].name.should.equal('image');
    mediaTypes[1].name.should.equal('document');
    mediaTypes[2].name.should.equal('video');
    mediaTypes[3].name.should.equal('unknown');
    done();
  });

  it ('get state types', function (done) {
    var stateTypes = enumService.getStateTypes();
    expect(stateTypes).to.be.a('Array');
    expect(stateTypes.length).to.equal(2);
    stateTypes.forEach(function (stateType) {
      expect(stateType).to.include.keys('name')
      expect(stateType).to.include.keys('description');
    });
    stateTypes[0].name.should.equal('active');
    stateTypes[1].name.should.equal('disabled');
    done();
  });

  it ('get auth types types', function (done) {
    var authTypes = enumService.getAuthTypes();
    expect(authTypes).to.be.a('Array');
    expect(authTypes.length).to.equal(3);
    authTypes.forEach(function (auth) {
      expect(auth).to.include.keys('name')
      expect(auth).to.include.keys('description');
      expect(auth).to.include.keys('isSecure');
      expect(auth).to.include.keys('icon');
    });
    authTypes[0].name.should.equal('password');
    authTypes[1].name.should.equal('email');
    authTypes[2].name.should.equal('none');
    done();
  });

  it ('get permission types', function (done) {
    var permissionTypes = enumService.getPermissionTypes();
    expect(permissionTypes).to.be.a('Array');
    expect(permissionTypes.length).to.equal(4);
    permissionTypes.forEach(function (permission) {
      expect(permission).to.include.keys('name')
      expect(permission).to.include.keys('description');
    });
    permissionTypes[0].name.should.equal('can-create');
    permissionTypes[1].name.should.equal('can-read');
    permissionTypes[2].name.should.equal('can-update');
    permissionTypes[3].name.should.equal('can-delete');
    done();
  });

});
