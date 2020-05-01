let organizations = require('../lib/organizations-service.js');

Bento.Register.Controller('OrganizationsController', function(controller) {
  controller.index = function*() {
    return yield organizations.index(this.query && this.query);
  };
  controller.create = function*() {
    return yield organizations.create(this.payload, this.auth.user);
  };
  controller.show = function*(id) {
    return yield organizations.show(id, this.query);
  };
  controller.action = function*(id, action) {
    return yield organizations.action(id, action, this.payload);
  };
  controller.addUser = function*() {
    return yield organizations.addUser(this.payload, this.auth.user);
  };
  controller.getStatements = function*(id) {
    return yield organizations.getStatements(id);
  };
  controller.createStatement = function*() {
    return yield organizations.createStatement(this.payload);
  };
  controller.payStatement = function*(statementId) {
    return yield organizations.payStatement(statementId, this.auth.user);
  };
  controller.deleteStatement = function*(statementId) {
    return yield organizations.deleteStatement(statementId);
  };
  return controller;
});
