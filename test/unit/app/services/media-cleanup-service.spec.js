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

var mediaCleanupService = IoC.create('services/media-cleanup-service');
var Media = IoC.create('models/media');

var deletableFolder = path.join(process.env.PWD, 'test', 'fixtures', 'temp', 'delete_folder');
var fixtureFilename = 'nyc.copy.jpg';
var fixture = path.join(deletableFolder, fixtureFilename);
var non_existant = 'nonexistantfile.none';

describe('media-cleanup-service', function() {

  before(function (done) {
    fs.mkdir(deletableFolder, function(err) {
      fs.createReadStream(path.join(process.env.PWD, 'test', 'fixtures', 'images', 'nyc.jpg'))
        .pipe(fs.createWriteStream(fixture))
        .on('close', function (err) { done(); });
    });
  });

  describe('Failed Cleanups', function () {

    beforeEach(function(done){
      Media.remove({}).exec(function (err) {
        done();
      });
    });

    it('should fail on media with no location', function (done) {
      var media = new Media({ filename: 'test' });
      media.save(function (err) {
        mediaCleanupService.deleteFile(media, function (err) {
          expect(err).to.exist();
          fs.exists(fixture, function (exists) {
            expect(exists).to.be.true;
            done();
          });
        });
      });
    });

    it('should fail on missing model', function (done) {
      mediaCleanupService.deleteFile(null, function (err) {
        expect(err).to.exist();
        fs.exists(fixture, function (exists) {
          expect(exists).to.be.true;
          done();
        });
      });
    });

    it('should fail non existant file', function (done) {
      var media = new Media({ state: 'active', location: non_existant, filename: 'test' });
      media.save(function (err) {
        mediaCleanupService.deleteFile(media, function (err) {
          expect(err).to.exist();
          fs.exists(fixture, function (exists) {
            expect(exists).to.be.true;
            done();
          })
        });
      });
    });
  });

  describe('Working Cleanup', function () {
    it ('Should delete file referenced by valid media', function (done) {
      var media = new Media({ state: 'active', location: fixture, filename: fixtureFilename });
      media.save(function (err, data) {
        mediaCleanupService.deleteFile(media, function (err) {
          expect(err).to.not.exist();
          fs.exists(fixture, function (exists) {
            expect(exists).to.be.false;
            done();
          })
        });
      });
     });
  });
});
