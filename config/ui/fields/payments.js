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
  chargeId : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Charge',
    helpText  : null
  },
  service : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Service',
    helpText  : null
  },
  amount : {
    component : 'input',
    type      : 'text',
    required  : false,
    label     : 'Amount',
    helpText  : null
  },
  currency : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Currency',
    helpText  : null
  },
  paid : {
    component : 'input',
    type      : 'checkbox',
    required  : true,
    label     : 'Paid',
    helpText  : null
  },
  captured : {
    component : 'input',
    type      : 'checkbox',
    required  : true,
    label     : 'Captured',
    helpText  : null
  },
  status : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Status',
    helpText  : null
  }
};