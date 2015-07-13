'use strict';

var assert = require('chai').assert;
var config = Reach.config;

describe('User Module', function () {
  this.timeout(10000);

  describe('POST /users', function () {

    // ### POST /users request object

    var request = require('request').defaults({
      uri     : config.api.uri + '/users',
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should report missing required fields', function (done) {
      request.post({}, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 400, body.message);
        assert.equal(body.message, 'The fields [firstName, lastName, email, password] is missing', body.message);
        assert.isArray(body.data.params, 'Params is not of type array');
        assert.lengthOf(body.data.params, 4, 'Array has length of ' + body.data.params.length);

        done();
      });
    });

    it('should create a new user', function (done) {
      request.post({
        body : {
          firstName : 'John',
          lastName  : 'Appleseed',
          email     : 'john.appleseed@test.none',
          password  : 'password'
        }
      }, function (err, res) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200);

        done();
      });
    });

    it('should report error if email is in use', function (done) {
      request.post({
        body : {
          firstName : 'John',
          lastName  : 'Appleseed',
          email     : 'john.appleseed@test.none',
          password  : 'password'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 400, body.message);
        assert.equal(body.code, 'ER_DUP_ENTRY', body.code);

        done();
      });
    });

  });

  describe('GET /users', function () {

    // ### GET /users request object

    var request = require('request').defaults({
      uri     : config.api.uri + '/users',
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should return a list of users', function (done) {
      request.get({}, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200, body.message);
        assert.isArray(body);
        assert.isAbove(body.length, 0);

        done();
      });
    });

  });

  describe('GET /users/me', function () {

    // ### GET /users request object

    var request = require('request').defaults({
      uri     : config.api.uri + '/users/me',
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should retrieve the authenticated users profile', function (done) {
      request.get({
        headers : {
          Authorization : Reach._mock.user.token
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.id, Reach._mock.user.id);
        assert.isUndefined(body.token, 'Token should not be included!');

        done();
      });
    });

    it('should 401 when invalid Authorization', function (done) {
      request.get({
        headers : {
          Authorization : 'invalid.auth.token'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 401, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'AUTH_INVALID_TOKEN', body.code);

        done();
      });
    });

    it('should 401 when missing Authorization', function (done) {
      request.get({}, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 401, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'AUTH_ERROR', body.code);

        done();
      });
    });

  });

  describe('GET /users/:id', function () {

    // ### GET /users/:id request object

    var request = require('request').defaults({
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should return with a user of the provided id', function (done) {
      request.get({
        uri : config.api.uri + '/users/1',
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.id, 1);

        done();
      });
    });

    it('should 404 when user not found', function (done) {
      request.get({
        uri : config.api.uri + '/users/1000',
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 404, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'USER_NOT_FOUND');

        done();
      });
    });

  });

  describe('PUT /users/:id', function () {

    var request = require('request').defaults({
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should update user data', function (done) {
      request.put({
        uri     : config.api.uri + '/users/' + Reach._mock.user.id,
        headers : {
          Authorization : Reach._mock.user.token
        },
        body : {
          firstName : 'Jack'
        }
      }, function (err, res) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200);

        done();
      });
    });

    it('should 401 when invalid Authorization', function (done) {
      request.put({
        uri     : config.api.uri + '/users/' + Reach._mock.user.id,
        headers : {
          Authorization : 'invalid.auth.token'
        },
        body : {
          firstName : 'Jack'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 401, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'AUTH_INVALID_TOKEN', body.code);

        done();
      });
    });

    it('should 401 when missing Authorization', function (done) {
      request.put({
        uri     : config.api.uri + '/users/' + Reach._mock.user.id,
        body : {
          firstName : 'Jack'
        }
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 401, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'AUTH_ERROR', body.code);

        done();
      });
    });

  });

  describe('DELETE /users/:id', function () {

    var request = require('request').defaults({
      json    : true,
      headers : {
        'content-type' : 'application/json'
      }
    });

    it('should delete a user', function (done) {
      request.del({
        uri     : config.api.uri + '/users/' + Reach._mock.user.id,
        headers : {
          Authorization : Reach._mock.user.token
        }
      }, function (err, res) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 200);

        done();
      });
    });

    it('should not find user after delete', function (done) {
      request.get({
        uri : config.api.uri + '/users/' + Reach._mock.user.id
      }, function (err, res, body) {
        if (err) {
          return done(err);
        }

        assert.equal(res.statusCode, 404, body.message);
        assert.isObject(body, 'Response is not of type object!');
        assert.equal(body.code, 'USER_NOT_FOUND', body.code);

        delete Reach._mock.user;

        done();
      });
    });

  });

});