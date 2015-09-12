'use strict';

module.exports = [
  {
    name    : 'LicensesList',
    type    : 'Table',
    title   : 'Licenses',
    fields  : [ 'id', 'userId', 'number', 'firstName', 'middleName', 'lastName', 'birthDate', 'country', 'state', 'fileId' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'LicensesCreate',
    title   : 'Add License',
    type    : 'Form',
    fields  : [ 'userId', 'number', 'firstName', 'middleName', 'lastName', 'birthDate', 'country', 'state', 'fileId' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'LicensesShow',
    title   : 'License',
    type    : 'Form',
    fields  : [ 'id', 'userId', 'number', 'firstName', 'middleName', 'lastName', 'birthDate', 'country', 'state', 'fileId' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
