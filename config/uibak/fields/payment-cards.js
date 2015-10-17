'use strict';

module.exports = {
  Id : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  customerId : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'User',
    helpText  : null
  },
  last4 : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last 4 Digits',
    helpText  : null
  },
  brand : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Brand',
    helpText  : null
  },
  expMonth : {
    component : 'input',
    type      : 'text',
    required  : false,
    label     : 'Expiry Month',
    helpText  : null
  },
  expYear : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Expiry Year',
    helpText  : null
  }
};