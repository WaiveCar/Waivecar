module.exports = [
  {
    label        : 'Old password',
    component    : 'input',
    type         : 'password',
    name         : 'oldPassword',
    className    : 'col-md-12 bento-form-input',
    helpText     : 'Enter your current password.'
  },
  {
    label        : 'New password',
    component    : 'input',
    type         : 'password',
    name         : 'password',
    className    : 'col-md-12 bento-form-input',
    helpText     : 'Enter your new password.'
  },
  {
    label        : 'Repeat password',
    component    : 'input',
    type         : 'password',
    name         : 'passwordVerify',
    className    : 'col-md-12 bento-form-input',
    helpText     : 'Enter your new password again to make sure you typed it correctly.'
  }
];
