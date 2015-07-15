'use strict';

var assert = require('chai').assert;
var User   = Reach.model('User');
var config = Reach.config;

describe('Auth Module', function () {
  this.timeout(10000);

  before(function *() {
    let user = new User({
      firstName : 'John',
      lastName  : 'Doe',
      email     : 'john.auth@test.none'
    });
    yield user.preparePassword('password');
    yield user.save();
  });

  describe('POST /auth/login', function () {

    // ### POST /auth/login request object

    var request = require('request').defaults({
      uri     : config.api.uri + '/auth/login',
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should successfully login', function (done) {
      request.post({
        body : {
          email    : 'john.auth@test.none',
          password : 'password'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.isDefined(body.token, 'Missing authorization token!');

        Reach._mock.user = body; // Add user to the Reach._mock object

        done();
      });
    });

    it('should validate auth token', function (done) {
      request.get({
        uri     : config.api.uri + '/auth/validate',
        headers : {
          Authorization : Reach._mock.user.token
        }
      }, function (err, res) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 204);

        done();
      });
    });

    it('should fail with wrong credentials', function (done) {
      request.post({
        body : {
          email    : 'john.auth@test.none',
          password : 'invalid.password'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 401, body.message);

        done();
      });
    });

  });

});