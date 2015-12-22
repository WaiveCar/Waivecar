import { fields } from 'bento-ui';

let layout = fields.mergeFromLayout('users', [
  [
    { name : 'firstName', className : 'col-md-6 bento-form-input' },
    { name : 'lastName',  className : 'col-md-6 bento-form-input' }
  ],
  [
    { name : 'email', className : 'col-md-6 bento-form-input' },
    { name : 'phone',  className : 'col-md-6 bento-form-input' }
  ]
]);

module.exports = layout;
