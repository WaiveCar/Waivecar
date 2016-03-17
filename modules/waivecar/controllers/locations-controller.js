'use strict';

let error = Bento.Error;
let Model = Bento.model('Location');
let _ = require('lodash');

Bento.Register.ResourceController('Location', 'LocationsController', function(controller) {

  controller.update = function *(id) {
    let model = yield Model.findById(id);
    let data  = this.payload;

    // ### Verify Resource Exists

    if (!model) {
      throw error.parse({
        code    : 'LOCATION_NOT_FOUND',
        message : 'Could not find resource requested for update'
      }, 404);
    }

    // ### Verify Ownership
    yield controller._hasAccess(this.auth.user, model);

    model._actor = this._actor;
    yield model.update(data);

    model.relay('update');

    return model;
  };

  controller._hasAccess = function *(user) {
    if (!user.hasAccess('admin')) {
      throw error.parse({
        code    : `LOCATION_INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 400);
    }
  };

  return controller;
});
