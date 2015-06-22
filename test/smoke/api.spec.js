var should = require('chai').should();
var app = require('../../app');
var expect = require('chai').expect;
var request = require('supertest');

var agent = request.agent(app);

describe('smoke tests for API', function() {

  this.timeout(30000);

  before(function(done) {
    // groan: have to force a wait so that App can start up all async tasks.
    setTimeout(done, 5000);
  });

  describe('api url', function() {
    
    it('should return a 401 response', function(done) {
      agent
        .get('/v1/users')
        .set('Accept', 'application/json')
        .expect(401)
        .end(done);
    });
  });

});
