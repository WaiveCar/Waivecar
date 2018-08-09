'use strict';

let error = Bento.Error;
let Location = Bento.model('Location');
let moment       = require('moment');
let Chargers = require('../lib/chargers-service');
let _ = require('lodash');

Bento.Register.ResourceController('Location', 'LocationsController', function(controller) {

  controller.index = function *() {
    var opts = this.query;
    var query = {
      // Legacy apps only know about one homebase.
      // We have two now with the addition of level in brooklyn
      // In order to facilitate this, we list the locations in
      // ascending order.
      order: [[ 'id', 'asc' ]]
    };
    if (opts.search) {
      query.where = { $or: [
        { name : { $like : `%${ opts.search }%` } },
        { address : { $like : `%${ opts.search }%` } }
      ]};
    }
    let locations =  (yield Location.find(query)).map((row) => {
      if(row.shape) {
        row.shape = JSON.parse(row.shape);
      }
  
      if(row.restrictions) {
        row.restrictions = JSON.parse(row.restrictions);
      }
      return row;
    });

    let chargers = yield Chargers.list();
    let res = locations.concat(chargers);

    if(opts.type) {
      return res.filter((row) => row.type === opts.type);
    }
    return res;
  };

  controller.dropoff = function *() {

    let locations = (yield Location.find({ where:
      {
        type: { $in: ['hub', 'zone', 'homebase'] }
        // only return entries after the date below ... we are considering
        // all the older ones to essentially be bullshit
        //created_at: { $gt: new Date(2017, 8, 1) }
      }
    })).map((row) => {
      if(row.shape) {
        row.shape = JSON.parse(row.shape);
      }
  
      if(row.restrictions) {
        row.restrictions = JSON.parse(row.restrictions);
      }
      return row;
    });

    let chargers = yield Chargers.list();
    return locations.concat(chargers);
  };
  
  function parseDayOfWeek(dayOfWeekStr) {
    switch (dayOfWeekStr.toUpperCase()) {
      case 'ALL': return 0;
      case 'MON': return 1;
      case 'TUE': return 2;
      case 'WED': return 3;
      case 'THU': return 4;
      case 'FRI': return 5;
      case 'SAT': return 6;
      case 'SUN': return 7;
    }
  
    throw error.parse({
      code    : 'LOCATION_INVALID_RESTRICTION_TIME',
      message : 'Invalid restriction day of week'
    }, 400);
  }
  
  function parseRestrictions(restrictionsStr) {
    return restrictionsStr.split('\n').map((row) => {
      return row.split('-').map(timeStr => {
        let dayOfWeek = parseDayOfWeek(timeStr.substring(0, 3));
        let time = moment(timeStr.substring(3), 'hh:mmA');
        
        if (!time.isValid()) {
          throw error.parse({
            code    : 'LOCATION_INVALID_RESTRICTION_TIME',
            message : 'Invalid restriction time format'
          }, 400);
        }
        
        return {
          day: dayOfWeek,
          hour: time.hour(),
          minute: time.minute()
        }
      });
    });
  }

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
      this.payload.shape = JSON.stringify(polygon);
    }
    
    if (this.payload.restrictions) {
      this.payload.restrictions =  JSON.stringify(parseRestrictions(this.payload.restrictions));
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
