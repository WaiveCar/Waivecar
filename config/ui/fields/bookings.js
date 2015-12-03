module.exports = {
  id : {
    name      : 'id',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  customerId : {
    name      : 'customerId',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'User',
    helpText  : null
  },
  carId : {
    name      : 'carId',
    component : 'select',
    options   : {
      lookup : 'cars',
      name   : 'id',
      value  : 'id'
    },
    required : true,
    label    : 'Select Car',
    helpText : null
  },
  paymentId : {
    name      : 'paymentId',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Payment',
    helpText  : null
  },
  filesId : {
    name      : 'fileId',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Photos',
    helpText  : null
  },
  state : {
    name      : 'state',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Status',
    helpText  : null
  },
  createdAt : {
    name      : 'createdAt',
    component : 'input',
    type      : 'date',
    required  : true,
    label     : 'Created At',
    helpText  : null
  },
  updatedAt : {
    name      : 'updatedAt',
    component : 'input',
    type      : 'date',
    required  : true,
    label     : 'Updated At',
    helpText  : null
  }
};
