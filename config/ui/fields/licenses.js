'use strict';

module.exports = {

  id : {
    name      : 'id',
    label     : 'ID',
    component : 'input',
    type      : 'text',
    required  : true,
    tabIndex  : 1
  },
  userId : {
    name      : 'userId',
    label     : 'User',
    component : 'select',
    options   : {
      lookup : 'user',
      name   : 'email',
      value  : 'id'
    },
    required : true,
    tabIndex : 2
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
    label     : 'Middle Name (optional)',
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
    component : 'date',
    required  : true,
    label     : 'Date Of Birth',
    helpText  : null
  },
  state : {
    name      : 'state',
    component : 'select',
    required  : true,
    label     : 'State',
    helpText  : null,
    options   : [
      { name : 'Alabama',                        value : 'AL' },
      { name : 'Alaska',                         value : 'AK' },
      { name : 'American Samoa',                 value : 'AS' },
      { name : 'Arizona',                        value : 'AZ' },
      { name : 'Arkansas',                       value : 'AR' },
      { name : 'California',                     value : 'CA' },
      { name : 'Colorado',                       value : 'CO' },
      { name : 'Connecticut',                    value : 'CT' },
      { name : 'Delaware',                       value : 'DE' },
      { name : 'District Of Columbia',           value : 'DC' },
      { name : 'Federated States Of Micronesia', value : 'FM' },
      { name : 'Florida',                        value : 'FL' },
      { name : 'Georgia',                        value : 'GA' },
      { name : 'Guam',                           value : 'GU' },
      { name : 'Hawaii',                         value : 'HI' },
      { name : 'Idaho',                          value : 'ID' },
      { name : 'Illinois',                       value : 'IL' },
      { name : 'Indiana',                        value : 'IN' },
      { name : 'Iowa',                           value : 'IA' },
      { name : 'Kansas',                         value : 'KS' },
      { name : 'Kentucky',                       value : 'KY' },
      { name : 'Louisiana',                      value : 'LA' },
      { name : 'Maine',                          value : 'ME' },
      { name : 'Marshall Islands',               value : 'MH' },
      { name : 'Maryland',                       value : 'MD' },
      { name : 'Massachusetts',                  value : 'MA' },
      { name : 'Michigan',                       value : 'MI' },
      { name : 'Minnesota',                      value : 'MN' },
      { name : 'Mississippi',                    value : 'MS' },
      { name : 'Missouri',                       value : 'MO' },
      { name : 'Montana',                        value : 'MT' },
      { name : 'Nebraska',                       value : 'NE' },
      { name : 'Nevada',                         value : 'NV' },
      { name : 'New Hampshire',                  value : 'NH' },
      { name : 'New Jersey',                     value : 'NJ' },
      { name : 'New Mexico',                     value : 'NM' },
      { name : 'New York',                       value : 'NY' },
      { name : 'North Carolina',                 value : 'NC' },
      { name : 'North Dakota',                   value : 'ND' },
      { name : 'Northern Mariana Islands',       value : 'MP' },
      { name : 'Ohio',                           value : 'OH' },
      { name : 'Oklahoma',                       value : 'OK' },
      { name : 'Oregon',                         value : 'OR' },
      { name : 'Palau',                          value : 'PW' },
      { name : 'Pennsylvania',                   value : 'PA' },
      { name : 'Puerto Rico',                    value : 'PR' },
      { name : 'Rhode Island',                   value : 'RI' },
      { name : 'South Carolina',                 value : 'SC' },
      { name : 'South Dakota',                   value : 'SD' },
      { name : 'Tennessee',                      value : 'TN' },
      { name : 'Texas',                          value : 'TX' },
      { name : 'Utah',                           value : 'UT' },
      { name : 'Vermont',                        value : 'VT' },
      { name : 'Virgin Islands',                 value : 'VI' },
      { name : 'Virginia',                       value : 'VA' },
      { name : 'Washington',                     value : 'WA' },
      { name : 'West Virginia',                  value : 'WV' },
      { name : 'Wisconsin',                      value : 'WI' },
      { name : 'Wyoming',                        value : 'WY' }
    ]
  },
  status : {
    name      : 'status',
    required  : true,
    label     : 'Status',
    component : 'select',
    required  : true,
    helpText  : null,
    options   : [
      { name : 'Pending',     value : 'pending' },
      { name : 'Provided',    value : 'provided' },
      { name : 'In Progress', value : 'in-progress' },
      { name : 'Complete',    value : 'complete' }
    ]
  },
  outcome : {
    name      : 'outcome',
    required  : true,
    label     : 'Outcome',
    component : 'select',
    required  : true,
    helpText  : null,
    options   : [
      { name : 'Consider', value : 'consider' },
      { name : 'Clear',    value : 'clear' }
    ]
  },
  report : {
    name      : 'report',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Report',
    helpText  : null
  },
  fileId : {
    name      : 'fileId',
    component : 'input',
    type      : 'text',
    required  : false,
    label     : 'Photo',
    helpText  : null
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
