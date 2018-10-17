import { fields } from 'bento-ui';

let layout = fields.mergeFromLayout('licenses', [
  [
    { name : 'firstName',  className : 'col-md-4 bento-form-input' },
    { name : 'middleName', className : 'col-md-4 bento-form-input' },
    { name : 'lastName',   className : 'col-md-4 bento-form-input' }
  ],
  [
    { name : 'birthDate', className : 'col-md-6 bento-form-input' },
    { name : 'expirationDate', className : 'col-md-6 bento-form-input' }
  ],
  [
    { name : 'number', className : 'col-md-6 bento-form-input' },
    { name : 'state',  className : 'col-md-6 bento-form-select' }
  ]
]);

module.exports = layout;
