'use strict';

module.exports = [
  {
    name    : 'LocationsList',
    title   : 'Locations',
    type    : 'Table',
    fields  : [ 'id', 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'LocationsCreate',
    title   : 'Add Location',
    type    : 'Form',
    fields  : [ 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'LocationsShow',
    title   : 'Location',
    type    : 'Form',
    fields  : [ 'id', 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  },
  {
    name    : 'LocationsMap',
    title   : 'Locations',
    type    : 'Map',
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'LocationsChart',
    title   : 'Locations',
    type    : 'MiniChart',
    fields  : [ 'id', 'createdAt' ],
    actions : {
      cancel : false,
      create : false,
      update : false,
      delete : false
    }
  }
];
