'use strict';

module.exports = [
  {
    name    : 'LocationsList',
    type    : 'table',
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
    type    : 'form',
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
    type    : 'form',
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
    type    : 'map',
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  }
];
