'use strict';

module.exports = [
  {
    name    : 'PaymentCardsList',
    type    : 'Table',
    title   : 'PaymentCards',
    fields  : [ 'Id', 'customerId', 'last4', 'brand', 'expMonth', 'expYear' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'PaymentCardsCreate',
    title   : 'Add PaymentCard',
    type    : 'Form',
    fields  : [ 'customerId', 'last4', 'brand', 'expMonth', 'expYear' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'PaymentCardsShow',
    title   : 'PaymentCard',
    type    : 'Form',
    fields  : [ 'Id', 'customerId', 'last4', 'brand', 'expMonth', 'expYear' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];
