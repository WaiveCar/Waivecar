import {fields} from 'bento-ui';

let layout = [
  [
    {
      label: 'First Name',
      component: 'input',
      type: 'text',
      name: 'firstName',
      className: 'col-md-6 bento-form-input',
      required: true,
    },
    {
      label: 'Last Name',
      component: 'input',
      type: 'text',
      name: 'lastName',
      className: 'col-md-6 bento-form-input',
      required: true,
    },
  ],
  [
    {
      label: 'Email',
      component: 'input',
      type: 'text',
      name: 'email',
      className: 'col-md-6 bento-form-input',
      required: true,
    },
    {
      label: 'Phone',
      component: 'input',
      type: 'text',
      name: 'phone',
      className: 'col-md-6 bento-form-input',
      required: true,
    },
  ],
  [
    {
      label: 'Address line 1',
      component: 'input',
      name: 'street1',
      className: 'col-md-12 bento-form-input',
    },
  ],
  [
    {
      label: 'Address line 2',
      component: 'input',
      name: 'street2',
      className: 'col-md-12 bento-form-input',
    },
  ],
  [
    {
      label: 'City',
      component: 'input',
      name: 'city',
      className: 'col-md-4 bento-form-input',
    },
    {
      label: 'State',
      component: 'input',
      name: 'state',
      className: 'col-md-4 bento-form-input',
    },
    {
      label: 'Zip',
      component: 'input',
      name: 'zip',
      className: 'col-md-4 bento-form-input',
    },
  ],
  [
    {
      label: 'License Number',
      component: 'input',
      name: 'number',
      className: 'col-md-4 bento-form-input',
    },
    {
      label: 'Birthday',
      component: 'input',
      type: 'date',
      name: 'birthDate',
      className: 'col-md-4 bento-form-input',
    },
    {
      label: 'Expiration Date',
      component: 'input',
      type: 'date',
      name: 'expirationDate',
      className: 'col-md-4 bento-form-input',
    },
  ],
];

module.exports = layout;
