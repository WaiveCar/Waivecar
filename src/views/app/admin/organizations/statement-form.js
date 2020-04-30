import {fields} from 'bento-ui';

let layout = [
  [
    {
      label: 'Billing Date',
      component: 'input',
      type: 'date',
      name: 'billingDate',
      className: 'col-md-4 bento-form-input',
      required: true,
    },
    {
      label: 'Due Date',
      component: 'input',
      type: 'date',
      name: 'dueDate',
      className: 'col-md-4 bento-form-input',
      required: true,
    },
    {
      label: 'Amount',
      component: 'input',
      type: 'number',
      name: 'amount',
      className: 'col-md-3 bento-form-input',
      required: true,
    },
  ],
  [
    {
      label: 'Notes',
      component: 'textarea',
      type: 'text',
      name: 'notes',
      className: 'col-md-12 bento-form-input',
    },
  ],
];

module.exports = layout;
