'use strict';

module.exports = [
  {
    name    : 'CarsList',
    title   : 'Cars',
    type    : 'Table',
    fields  : [ 'id', 'make', 'year', 'manufacturer' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : false
    }
  },
  {
    name   : 'CarsSelect',
    title  : 'Car',
    type   : 'Form',
    fields : [ 'make', 'year' ]
  },
  {
    name    : 'CarsShow',
    title   : 'Car',
    type    : 'Form',
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
    title   : 'Cars',
    type    : 'Map',
    actions : {
      cancel : true,
      create : false,
      update : false,
      delete : false
    }
  },
  {
    name    : 'CarsChart',
    title   : 'Cars',
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
