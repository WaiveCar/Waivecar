'use strict';

let assert = require('chai').assert;
let config = Reach.config;

// ### Mocks

let storeConfig = config.mysql;

describe('Bootstrap', function () {
  this.timeout(10000);

  describe('Database', function () {
    let db = require('../bootstrap/database');

    it('should fail when no mysql config', function *() {
      Reach.config.mysql = null;
      try {
        yield db();
      } catch (err) {
        assert.equal(err.code, 'MYSQL_NO_CONFIG');
      }
    });

    it('should succeed with good config', function *() {
      Reach.config.mysql = storeConfig;
      try {
        yield db();
      } catch (err) {
        assert.isUndefined(err);
      }
    });
  });

  describe('Schemas', function () {
    let models = require('../bootstrap/models');

    config.mysql.force = false; // Don't delete old records at this point

    it('should create tables from all models in the api', function *() {
      yield models();
    });
  });
});