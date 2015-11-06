module.exports = [
  {
    label        : 'Name (as it appears on your card)',
    component    : 'input',
    type         : 'text',
    name         : 'name',
    className    : 'col-md-12 bento-form-input'
  },
  {
    label        : 'Card number (no dashes or spaces)',
    component    : 'input',
    type         : 'text',
    name         : 'number',
    className    : 'col-md-12 bento-form-input'
  },
  [
    {
      label        : 'Expiration month',
      component    : 'select',
      name         : 'exp_month',
      className    : 'col-md-6 bento-form-select',
      options      : [
        { name  : '1 - January',    value : '1' },
        { name  : '2 - February',   value : '2' },
        { name  : '3 - March',      value : '3' },
        { name  : '4 - April',      value : '4' },
        { name  : '5 - May',        value : '5' },
        { name  : '6 - June',       value : '6' },
        { name  : '7 - July',       value : '7' },
        { name  : '8 - August',     value : '8' },
        { name  : '9 - September',  value : '9' },
        { name  : '10 - October',   value : '10' },
        { name  : '11 - November',  value : '11' },
        { name  : '12 - December',  value : '12' }
      ]
    },
    {
      label        : 'Expiration year',
      component    : 'select',
      name         : 'exp_year',
      className    : 'col-md-6 bento-form-select',
      options      : () => {
        let date   = new Date();
        let year   = date.getFullYear();
        let result = [];
        for (let i = year, len = year + 20; i < len; i++) {
          result.push({
            name  : new String(i),
            value : new String(i)
          });
        }
        return result;
      }()
    }
  ],
  {
    label        : 'CVC',
    component    : 'input',
    type         : 'text',
    name         : 'cvc',
    className    : 'col-md-12 bento-form-input'
  }
]