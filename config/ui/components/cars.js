'use strict';

module.exports = [
  {
    name    : 'CarsList',
    type    : 'table',
    fields  : [ 'id', 'make', 'year', 'manufacturer' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : false
    }
  },
  {
    name    : 'CarsShow',
    type    : 'form',
    fields  : [ 'id', 'make', 'year', 'manufacturer', 'phone', 'unitType', 'onstarStatus', 'primaryDriverId', 'primaryDriverUrl', 'url', 'isInPreActivation' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : false
    }
  },
  {
    name    : 'CarsMap',
    type    : 'map',
    actions : {
      cancel : true,
      create : false,
      update : false,
      delete : false
    }
  }
];
