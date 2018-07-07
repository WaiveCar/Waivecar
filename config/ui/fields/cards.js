'use strict';

module.exports = {

  id : {
    name      : 'id',
    label     : 'ID',
    component : 'input',
    type      : 'text',
    required  : true,
  },
  name : {
    name      : 'name',
    label     : 'Name (as it appears on your card)',
    component : 'input',
    type      : 'text',
  },
  number : {
    name      : 'number',
    label     : 'Card number (no dashes or spaces)',
    component : 'input',
    type      : 'text',
  },
  expMonth : {
    name      : 'expMonth',
    label     : 'Expiration month',
    component : 'select',
    options   : [
      { name : '1 - January',    value : '1' },
      { name : '2 - February',   value : '2' },
      { name : '3 - March',      value : '3' },
      { name : '4 - April',      value : '4' },
      { name : '5 - May',        value : '5' },
      { name : '6 - June',       value : '6' },
      { name : '7 - July',       value : '7' },
      { name : '8 - August',     value : '8' },
      { name : '9 - September',  value : '9' },
      { name : '10 - October',   value : '10' },
      { name : '11 - November',  value : '11' },
      { name : '12 - December',  value : '12' }
    ]
  },
  expYear : {
    name      : 'expYear',
    label     : 'Expiration year',
    component : 'select',
    options   : (function(){ 
      let date   = new Date();
      let year   = date.getFullYear();
      let result = [];
      for (let i = year, len = year + 20; i < len; i++) {
        result.push({
          name  : i.toString(),
          value : i.toString()
        });
      }
      return result;
    })()
  },
  cvc : {
    name      : 'cvc',
    label     : 'CVC',
    component : 'input',
    type      : 'text',
  }
};
