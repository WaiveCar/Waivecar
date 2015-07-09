/*
  Tests
  =====

  Stability: 2 - Stable

  Add all your tests relative to their functionality in your API folder to keep with
  good organization and add your tests to the list.

  @author Christoffer Rødvik
 */

'use strict';

var co      = require('co');
var coMocha = require('co-mocha');
var Mocha   = require('mocha');
var path    = require('path');

// ### Reach API

require('reach-api');

// ### Generator Support
// Add the generator support to the Mocha class

coMocha(Mocha);

// ### Test
// Creates a test object on the reach core that can be used to store data during testing.

Reach.test = {};

// ### Announcement
// Console log api startup

var title = 'TESTING ' + reach.config.api.name + ' @ ' + reach.config.api.version;
var bline = new Array(title.length + 1).join('=');

console.log('\n  ' + title);
console.log('  ' + bline);

co(function *() {
  try {
    yield Reach.App();

    // ### Mocha

    var mocha = new Mocha();

    // ### Custom Tests

    reach.config.test.custom.forEach(function (file) {
      mocha.addFile(path.join(__dirname, 'test', file + '.test.js'));
    });

    // ### Service Tests
    // List of services you wish to test, remember to register the tests in your
    // service index.js file before adding them here.

    reach.config.test.services.forEach(function (service) {
      var tests = Reach.store.tests[service];
      if (!tests) {
        Reach.Logger.warn('%s service does not have any registered unit tests', service);
        return;
      }
      Reach.store.tests[service].forEach(function (test) {
        mocha.addFile(test);
      });
    });

    // ### Module Tests
    // List of modules you wish to test, remember to register the tests in your
    // module index.js file before adding them here.

    reach.config.test.modules.forEach(function (module) {
      var tests = Reach.store.tests[module];
      if (!tests) {
        Reach.Logger.warn('%s module does not have any registered unit tests', module);
        return;
      }
      Reach.store.tests[module].forEach(function (test) {
        mocha.addFile(test);
      });
    });

    // ### Run Tests
    // Runs the test added to the above list

    mocha.run(process.exit);
  } catch (err) {
    Reach.Logger.error({
      code    : err.code,
      message : err.toString()
    });
    console.log('\n  You must resolve startup errors, aborting...\n');
    return process.exit();
  }
});