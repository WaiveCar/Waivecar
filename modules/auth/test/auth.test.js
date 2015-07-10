/*
  Auth Module Tests
  =================
  @author Christoffer Rødvik
  @github https://github.com/kodemon/reach-api
 */

'use strict';

// ### Dependencies

var assert = require('chai').assert;
var config = Reach.config;

// ### Unit Tests

describe('Auth Module', function () {

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
          email    : 'john.doe@test.none',
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
          email    : 'john.doe@test.none',
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