'use strict';

module.exports = {

  id : {
    label     : 'ID',
    component : 'input',
    type      : 'text',
    name      : 'id',
    required  : true,
    tabIndex  : 1
  },
  userId : {
    label     : 'User',
    component : 'reach-select',
    options   : {
      lookup : 'user',
      name   : 'email',
      value  : 'id'
    },
    name      : 'userId',
    required  : true,
    tabIndex  : 2
  },
  number : {
    name      : 'number',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'License Number',
    helpText  : null
  },
  firstName : {
    name      : 'firstName',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'First Name',
    helpText  : null
  },
  middleName : {
    name      : 'middleName',
    component : 'input',
    type      : 'text',
    required  : false,
    label     : 'Middle Name',
    helpText  : null
  },
  lastName : {
    name      : 'lastName',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Name',
    helpText  : null
  },
  birthDate : {
    name      : 'birthDate',
    component : 'input',
    type      : 'date',
    required  : true,
    label     : 'Date Of Birth',
    helpText  : null
  },
  country : {
    name      : 'country',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Country',
    helpText  : null
  },
  state : {
    state     : 'state',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'State',
    helpText  : null
  },
  fileId : {
    name      : 'fileId',
    component : 'input',
    type      : 'text',
    required  : false,
    label     : 'Photo',
    helpText  : null
  }
};