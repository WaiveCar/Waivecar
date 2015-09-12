'use strict';

module.exports = [
  {
    name    : 'PaymentsList',
    type    : 'Table',
    title   : 'Payments',
    fields  : [ 'Id', 'customerId', 'chargeId', 'service', 'amount', 'currency', 'paid', 'captured', 'status' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'PaymentsCreate',
    title   : 'Add Payment',
    type    : 'Form',
    fields  : [ 'customerId', 'chargeId', 'service', 'amount', 'currency', 'paid', 'captured', 'status' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'PaymentsShow',
    title   : 'Payment',
    type    : 'Form',
    fields  : [ 'Id', 'customerId', 'chargeId', 'service', 'amount', 'currency', 'paid', 'captured', 'status' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
