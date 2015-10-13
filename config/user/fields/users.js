module.exports = {
  id : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  role : {
    component : 'react-select',
    options : [
      {
        name  : 'User',
        value : 'user'
      },
      {
        name  : 'Admin',
        value : 'admin'
      }
    ],
    label    : 'Role',
    helpText : 'Select a Role'
  },
  status : {
    component : 'react-select',
    options   : [
      {
        name  : 'Pending',
        value : 'pending'
      },
      {
        name  : 'Active',
        value : 'active'
      },
      {
        name  : 'Suspended',
        value : 'suspended'
      }
    ],
    label    : 'Status',
    helpText : 'Select a Status'
  },
  firstName : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'First Name',
    helpText  : null
  },
  lastName : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Name',
    helpText  : null
  },
  email : {
    component : 'input',
    type      : 'email',
    required  : true,
    label     : 'Email Address',
    helpText  : null
  },
  password : {
    component : 'input',
    type      : 'password',
    required  : true,
    label     : 'Password',
    helpText  : 'choose a password longer than 6 characters'
  }
};