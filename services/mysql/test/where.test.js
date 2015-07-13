'use strict';

let assert = require('chai').assert;
let where  = require('../where');

// ### Mocks

let query = {
  firstName : 'Chris',
  age       : 19.3,
  sort      : ['firstName', 'ASC'],
  limit     : 10,
  offset    : 10
};

describe('Where', function () {
  it('should create valid where from query', function () {
    let result = where(query, {
      firstName : {
        $like : '?%'
      },
      age : {
        $gte : '?'
      }
    });
    assert.isDefined(result);
    assert.isObject(result);
    assert.isDefined(result.firstName.$like);
    assert.equal(result.firstName.$like, 'Chris%');
    assert.isNumber(result.age.$gte);
    assert.equal(result.age.$gte, 19.3);
  });

  it('should provide an empty where from query', function () {
    let result = where(query, {});
    assert.isDefined(result);
    assert.isObject(result);
    assert.equal(Object.keys(result), 0);
  });
});