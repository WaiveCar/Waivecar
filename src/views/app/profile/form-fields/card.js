'use strict';

import { fields } from 'bento-ui';

let layout = fields.mergeFromLayout('cards', [
  { name : 'name',   className : 'col-md-12 bento-form-input' },
  { name : 'number', className : 'col-md-12 bento-form-input' },
  [
    { name : 'expMonth', className : 'col-md-6 bento-form-select' },
    { name : 'expYear',  className : 'col-md-6 bento-form-select' }
  ],
  { name : 'cvc', className : 'col-md-12 bento-form-input' }
]);

module.exports = layout;
