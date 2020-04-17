let organizations = require('../lib/organizations-service.js');

Bento.Register.Controller('OrganizationsController', function(controller) {
  controller.index = function*() {
    return yield organizations.index(this.query && this.query);
  };
  controller.create = function*() {
    return yield organizations.create(this.payload);
  };
  controller.show = function*(id) {
    return yield organizations.show(id);
  };
  controller.action = function*(id, action) {
    return yield organizations.action(id, action, this.payload);
  };
  controller.addUser = function*() {
    return yield organizations.addUser(this.payload, this.auth.user);
  };
  return controller;
});
