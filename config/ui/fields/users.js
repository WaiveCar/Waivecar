module.exports = {
  id : {
    name      : 'id',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  role : {
    name      : 'role',
    component : 'select',
    options   : [
      {
        name  : 'User',
        value : '1'
      },
      {
        name  : 'Moderator',
        value : '2'
      },
      {
        name  : 'Administrator',
        value : '3'
      },
      {
        name  : 'Owner',
        value : '4'
      },
      {
        name  : 'Super User',
        value : '5'
      }
    ],
    label    : 'Role',
    helpText : 'Select a Role'
  },
  status : {
    name      : 'status',
    component : 'select',
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
    name      : 'firstName',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'First Name',
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
  email : {
    name      : 'email',
    component : 'input',
    type      : 'email',
    required  : true,
    label     : 'Email Address',
    helpText  : null
  },
  phone : {
    name      : 'phone',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Cell Phone',
    helpText  : null
  },
  password : {
    name      : 'password',
    component : 'input',
    type      : 'password',
    required  : true,
    label     : 'Password',
    helpText  : 'choose a password longer than 6 characters'
  },
  createdAt : {
    name      : 'createdAt',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Created At',
    helpText  : null
  },
  updatedAt : {
    name      : 'updatedAt',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Updated At',
    helpText  : null
  }
};
