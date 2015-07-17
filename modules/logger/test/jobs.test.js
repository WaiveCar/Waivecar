'use strict';

let assert = require('chai').assert;
let event  = Reach.Event;
let _mock  = {
  id   : 'sample',
  from : {
    id    : 'GUEST',
    ip    : '127.0.0.1'
  },
  details : {
    uri     : '/mock/uri',
    route   : '/mock/:type',
    code    : 'MOCK_CODE',
    message : 'Mock message',
    data    : {}
  },
  stack : []
};

it('should handle 500 events', function *() {
  setTimeout(function () {
    event.emit('error:500', _mock);
  }, 1000);

  yield function (done) {
    event.on('logger:test', function *(res) {
      assert.equal(1, res.affectedRows);
      done();
    });
  };
});