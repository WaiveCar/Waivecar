'use strict';

let assert  = require('chai').assert;
let service = require('../lib/user-service');

// ### Mock

let _mockAdmin = null;
let _mockUser  = null;

// ### Create

/*
describe('create', () => {
  it ('should create a new user', function *() {
    yield service.store(mock);
  });

  it ('should fail on duplicate email', function *() {
    try {
      yield service.store(mock);
    } catch (err) {
      assert.equal(err.code,      'SEQUELIZE_SAVE_ERROR');
      assert.equal(err.data.type, 'UNIQUE_VIOLATION');
    }
  });
});
*/

// ### Get

describe('get', () => {
  it ('should return a user', function *() {
    _mockAdmin = yield service.get(1);
    _mockUser  = yield service.get(2);

    assert.equal(_mockAdmin.firstName, 'John');
    assert.equal(_mockUser.firstName, 'Jane');
  });

  it ('it should 404 when no user is found', function *() {
    try {
      yield service.get(0);
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });
});

// ### Update

describe('update', () => {
  it ('should successfully update a user', function *() {
    let user = yield service.update(_mockUser.id, {
      firstName : 'Jerry'
    }, _mockUser);
    assert.equal(user.firstName, 'Jerry');
  });

  it ('should be able to update another user if admin', function *() {
    yield service.update(_mockUser.id, {}, _mockAdmin);
  });

  it ('should 400 if user does not have access', function *() {
    try {
      yield service.update(_mockAdmin.id, {}, _mockUser);
    } catch (err) {
      assert.equal(err.status, 400);
    }
  });

  it ('should 404 if user does not exist', function *() {
    try {
      yield service.update(999, {}, _mockUser);
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });
});

// ### Delete

describe('delete', () => {
  it ('should successfully delete a user', function *() {
    yield service.delete(_mockUser.id, _mockAdmin);
    try {
      yield service.get(_mockUser.id, _mockAdmin);
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });

  it ('should 404 if user does not exist', function *() {
    try {
      yield service.delete(999, {}, _mockAdmin);
    } catch (err) {
      assert.equal(err.status, 404);
    }
  });
});
