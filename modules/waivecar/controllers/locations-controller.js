'use strict';

let error = Bento.Error;
let Location = Bento.model('Location');
let _ = require('lodash');

Bento.Register.ResourceController('Location', 'LocationsController', function(controller) {

  controller.dropoff = function *() {
    return yield Location.find({ where: 
      {
        type: { $in: ['dropoff', 'homebase'] }
        // only return entries after the date below ... we are considering
        // all the older ones to essentially be bullshit
        //created_at: { $gt: new Date(2017, 8, 1) }
      }
    });
  };

  controller.create = function *() {
    // we presume that there's a newline delineated blob of
    // text for the shape. We need to clean that up.
    if(this.payload.shape) {
      let polygon = [];
      this.payload.shape.split('\n').forEach((row) => {
        let parts = row.split(',');
        if(parts.length >= 2) {
          polygon.push([parseFloat(parts[0], 10), parseFloat(parts[1], 10)]);
        }
      });
      this.payload.shape = polygon;
    }

    let model = new Location(this.payload);

    yield model.save();
    model.relay({
      type: 'store'
    });
  };

  controller.update = function *(id) {
    let model = yield Location.findById(id);
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

  controller.delete = function *(id) {
    let location = yield Location.findById(id);

    if (!location) {
      throw error.parse({
        code    : 'LOCATION_NOT_FOUND',
        message : 'Could not find resource requested for delete'
      }, 404);
    }

    yield controller._hasAccess(this.auth.user, location);

    yield location.delete();

    location.relay('delete');
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
