module.exports = {
  bookings: {
    carId: {
      component: 'select',
      helpText: null,
      label: 'Car',
      name: 'carId',
      options: {lookup: 'cars', name: 'id', value: 'id'},
      required: true,
    },
    createdAt: {
      component: 'input',
      helpText: null,
      label: 'Created At',
      name: 'createdAt',
      required: true,
      type: 'date',
    },
    filesId: {
      component: 'input',
      helpText: null,
      label: 'Photos',
      name: 'fieldId',
      required: true,
      type: 'text',
    },
    id: {
      component: 'input',
      helpText: null,
      label: 'Id',
      name: 'id',
      required: true,
      type: 'text',
    },
    paymentId: {
      component: 'input',
      helpText: null,
      label: 'Payment',
      name: 'paymentId',
      required: true,
      type: 'text',
    },
    status: {
      component: 'input',
      helpText: null,
      label: 'Status',
      name: 'status',
      required: true,
      type: 'text',
    },
    updatedAt: {
      component: 'input',
      helpText: null,
      label: 'Updated At',
      name: 'updatedAt',
      required: true,
      type: 'date',
    },
    userId: {
      component: 'input',
      helpText: null,
      label: 'User',
      name: 'userId',
      required: true,
      type: 'text',
    },
  },
  cars: {
    alarmInput: {
      name: 'alarmInput',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Alarm Input',
      helpText: null,
    },
    bluetooth: {
      name: 'bluetooth',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Bluetooth',
      helpText: null,
    },
    boardVoltage: {
      name: 'boardVoltage',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Board Voltage',
      helpText: null,
    },
    calculatedSpeed: {
      name: 'calculatedSpeed',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Calculated Speed',
      helpText: null,
    },
    createdAt: {
      name: 'createdAt',
      component: 'input',
      type: 'date',
      required: true,
      label: 'Created At',
      helpText: null,
    },
    currentSpeed: {
      name: 'currentSpeed',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Speed',
      helpText: null,
    },
    distanceSinceLastRead: {
      name: 'distanceSinceLastRead',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Distance Since Last Read',
      helpText: null,
    },
    charge: {
      name: 'charge',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Charge',
      helpText: null,
    },
    comments: {
      name: 'comments',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Comments',
      helpText: null,
    },
    fileId: {
      name: 'fileId',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Photo',
      helpText: null,
    },
    id: {
      name: 'id',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Id',
      helpText: null,
    },
    isAvailable: {
      name: 'isAvailable',
      component: 'checkbox',
      required: true,
      label: 'available',
      helpText: null,
    },
    isChargeCardSecure: {
      name: 'isChargeCardSecure',
      component: 'checkbox',
      type: 'text',
      required: true,
      label: 'Charge Card Secure',
      helpText: null,
    },
    isCharging: {
      name: 'isCharging',
      component: 'checkbox',
      required: true,
      label: 'Charging',
      helpText: null,
    },
    isIgnitionOn: {
      name: 'isIgnitionOn',
      component: 'checkbox',
      type: 'text',
      required: true,
      label: 'Ignition',
      helpText: null,
    },
    isImmobilized: {
      name: 'isImmobilized',
      component: 'checkbox',
      required: true,
      label: 'Immobilized',
      helpText: null,
    },
    isKeySecure: {
      name: 'isKeySecure',
      component: 'checkbox',
      type: 'text',
      required: true,
      label: 'Key Secure',
      helpText: null,
    },
    isLocked: {
      name: 'isLocked',
      component: 'checkbox',
      required: true,
      label: 'Locked',
      helpText: null,
    },
    isOnChargeAdapter: {
      name: 'isOnChargeAdapter',
      component: 'checkbox',
      required: true,
      label: 'On Charge Adapter',
      helpText: null,
    },
    isParked: {
      name: 'isParked',
      component: 'checkbox',
      required: true,
      label: 'Parked',
      helpText: null,
    },
    isQuickCharging: {
      name: 'isQuickCharging',
      component: 'checkbox',
      required: true,
      label: 'Quick Charging',
      helpText: null,
    },
    isWaivework: {
      name: 'isWaivework',
      component: 'checkbox',
      required: true,
      label: 'Is Waive Work',
      helpText: null,
    },
    lastServiceAt: {
      name: 'lastServiceAt',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Last Service',
      helpText: null,
    },
    latitude: {
      name: 'latitude',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Latitude',
      helpText: null,
    },
    license: {
      name: 'license',
      component: 'input',
      type: 'text',
      required: true,
      label: 'License',
      helpText: null,
    },
    locationQuality: {
      name: 'locationQuality',
      component: 'input',
      type: 'text',
      required: true,
      label: ':ocation Quality',
      helpText: null,
    },
    lockLastCommand: {
      name: 'lockLastCommand',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Last Lock Command',
      helpText: null,
    },
    longitude: {
      name: 'longitude',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Longitude',
      helpText: null,
    },
    make: {
      name: 'make',
      component: 'select',
      type: 'text',
      required: true,
      label: 'Make',
      helpText: null,
    },
    manufacturer: {
      name: 'manufacturer',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Manufacturer',
      helpText: null,
    },
    mileageSinceImmobilizerUnlock: {
      name: 'mileageSinceImmobilizerUnlock',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Mileage Since Last Unlock',
      helpText: null,
    },
    model: {
      name: 'model',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Model',
      helpText: null,
    },
    plateNumberWork: {
      name: 'plateNumberWork',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Plate Number',
      helpText: null,
    },
    plateState: {
      name: 'plateState',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Plate State',
      helpText: null,
    },
    positionUpdatedAt: {
      name: 'positionUpdatedAt',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Last Position Update',
      helpText: null,
    },
    range: {
      name: 'range',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Current Range',
      helpText: null,
    },
    totalMileage: {
      name: 'totalMileage',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Total Mileage',
      helpText: null,
    },
    updatedAt: {
      name: 'updatedAt',
      component: 'input',
      type: 'date',
      required: true,
      label: 'Updated At',
      helpText: null,
    },
    userId: {
      name: 'userId',
      component: 'input',
      type: 'text',
      required: true,
      label: 'User',
      helpText: null,
    },
    vin: {
      name: 'vin',
      component: 'input',
      type: 'text',
      required: true,
      label: 'VIN',
      helpText: null,
    },
    year: {
      name: 'year',
      component: 'input',
      type: 'text',
      required: true,
      label: 'Year',
      helpText: null,
    },
  },
  cards: {
    cvc: {name: 'cvc', label: 'CVC', component: 'input', type: 'text'},
    expMonth: {
      name: 'expMonth',
      label: 'Expiration month',
      component: 'select',
      options: [
        {name: '1 - January', value: '1'},
        {name: '2 - February', value: '2'},
        {name: '3 - March', value: '3'},
        {name: '4 - April', value: '4'},
        {name: '5 - May', value: '5'},
        {name: '6 - June', value: '6'},
        {name: '7 - July', value: '7'},
        {name: '8 - August', value: '8'},
        {name: '9 - September', value: '9'},
        {name: '10 - October', value: '10'},
        {name: '11 - November', value: '11'},
        {name: '12 - December', value: '12'},
      ],
    },
    expYear: {
      name: 'expYear',
      label: 'Expiration year',
      component: 'select',
      options: [
        {name: '2018', value: '2018'},
        {name: '2019', value: '2019'},
        {name: '2020', value: '2020'},
        {name: '2021', value: '2021'},
        {name: '2022', value: '2022'},
        {name: '2023', value: '2023'},
        {name: '2024', value: '2024'},
        {name: '2025', value: '2025'},
        {name: '2026', value: '2026'},
        {name: '2027', value: '2027'},
        {name: '2028', value: '2028'},
        {name: '2029', value: '2029'},
        {name: '2030', value: '2030'},
        {name: '2031', value: '2031'},
        {name: '2032', value: '2032'},
        {name: '2033', value: '2033'},
        {name: '2034', value: '2034'},
        {name: '2035', value: '2035'},
        {name: '2036', value: '2036'},
        {name: '2037', value: '2037'},
      ],
    },
    id: {
      name: 'id',
      label: 'ID',
      component: 'input',
      type: 'text',
      required: true,
    },
    name: {
      name: 'name',
      label: 'Name (as it appears on your card)',
      component: 'input',
      type: 'text',
    },
    number: {
      name: 'number',
      label: 'Card number (no dashes or spaces)',
      component: 'input',
      type: 'text',
    },
  },
  licenses: {
    birthDate: {
      name: 'birthDate',
      component: 'input',
      type: 'date',
      required: true,
      label: 'Date Of Birth',
      helpText: null,
    },
    expirationDate: {
      name: 'expirationDate',
      component: 'input',
      type: 'date',
      required: true,
      label: 'Expiration Date',
      helpText: null,
    },
    createdAt: {
      component: 'input',
      helpText: null,
      label: 'Created At',
      name: 'createdAt',
      required: true,
      type: 'text',
    },
    fileId: {
      component: 'input',
      helpText: null,
      label: 'Photo',
      name: 'fileId',
      required: true,
      type: 'text',
    },
    firstName: {
      component: 'input',
      helpText: null,
      label: 'First Name',
      name: 'firstName',
      required: true,
      type: 'text',
    },
    id: {
      component: 'input',
      label: 'ID',
      name: 'id',
      required: true,
      tabIndex: 1,
      type: 'text',
    },
    lastName: {
      component: 'input',
      helpText: null,
      label: 'Last Name',
      name: 'lastName',
      required: true,
      type: 'text',
    },
    middleName: {
      component: 'input',
      helpText: null,
      label: 'Middle Name (optional)',
      name: 'middleName',
      required: false,
      type: 'text',
    },
    number: {
      component: 'input',
      helpText: null,
      label: 'License Number',
      name: 'number',
      required: true,
      type: 'text',
    },
    outcome: {
      component: 'select',
      helpText: null,
      lable: 'Outcome',
      name: 'outcome',
      options: [
        {name: 'Consider', value: 'consider'},
        {name: 'Clear', value: 'clear'},
      ],
      required: true,
    },
    report: {
      component: 'input',
      helpText: null,
      label: 'Report',
      name: 'report',
      required: true,
      type: 'text',
    },
    street1: {
      component: 'input',
      helpText: null,
      label: 'Address Line 1',
      name: 'street1',
      required: false,
      type: 'text',
    },
    street2: {
      component: 'input',
      helpText: null,
      label: 'Address Line 2',
      name: 'street2',
      required: false,
      type: 'text',
    },
    city: {
      component: 'input',
      helpText: null,
      label: 'city',
      name: 'city',
      required: false,
      type: 'text',
    },
    state: {
      component: 'select',
      helpText: null,
      label: 'State',
      name: 'state',
      options: [
        {name: 'Alabama', value: 'AL'},
        {name: 'Alaska', value: 'AK'},
        {name: 'American Samoa', value: 'AS'},
        {name: 'Arizona', value: 'AZ'},
        {name: 'Arkansas', value: 'AR'},
        {name: 'California', value: 'CA'},
        {name: 'Colorado', value: 'CO'},
        {name: 'Connecticut', value: 'CT'},
        {name: 'Delaware', value: 'DE'},
        {name: 'District Of Columbia', value: 'DC'},
        {name: 'Federated States Of Micronesia', value: 'FM'},
        {name: 'Florida', value: 'FL'},
        {name: 'Georgia', value: 'GA'},
        {name: 'Guam', value: 'GU'},
        {name: 'Hawaii', value: 'HI'},
        {name: 'Idaho', value: 'ID'},
        {name: 'Illinois', value: 'IL'},
        {name: 'Indiana', value: 'IN'},
        {name: 'Iowa', value: 'IA'},
        {name: 'Kansas', value: 'KS'},
        {name: 'Kentucky', value: 'KY'},
        {name: 'Louisiana', value: 'LA'},
        {name: 'Maine', value: 'ME'},
        {name: 'Marshall Islands', value: 'MH'},
        {name: 'Maryland', value: 'MD'},
        {name: 'Massachusetts', value: 'MA'},
        {name: 'Michigan', value: 'MI'},
        {name: 'Minnesota', value: 'MN'},
        {name: 'Mississippi', value: 'MS'},
        {name: 'Missouri', value: 'MO'},
        {name: 'Montana', value: 'MT'},
        {name: 'Nebraska', value: 'NE'},
        {name: 'Nevada', value: 'NV'},
        {name: 'New Hampshire', value: 'NH'},
        {name: 'New Jersey', value: 'NJ'},
        {name: 'New Mexico', value: 'NM'},
        {name: 'New York', value: 'NY'},
        {name: 'North Carolina', value: 'NC'},
        {name: 'North Dakota', value: 'ND'},
        {name: 'Northern Mariana Islands', value: 'MP'},
        {name: 'Ohio', value: 'OH'},
        {name: 'Oklahoma', value: 'OK'},
        {name: 'Oregon', value: 'OR'},
        {name: 'Pennsylvania', value: 'PA'},
        {name: 'Puerto Rico', value: 'PR'},
        {name: 'Rhode Island', value: 'RI'},
        {name: 'South Carolina', value: 'SC'},
        {name: 'South Dakota', value: 'SD'},
        {name: 'Tennessee', value: 'TN'},
        {name: 'Texas', value: 'TX'},
        {name: 'Vermont', value: 'VT'},
        {name: 'Virgin Islands', value: 'VI'},
        {name: 'Virginia', value: 'VA'},
        {name: 'West Virginia', value: 'WV'},
        {name: 'Wisconsin', value: 'WI'},
        {name: 'Wyoming', value: 'WY'},
      ],
      required: true,
    },
    zip: {
      component: 'input',
      helpText: null,
      label: 'zip',
      name: 'zip',
      required: false,
      type: 'text',
    },
    status: {
      component: 'select',
      helpText: null,
      label: 'Status',
      name: 'status',
      options: [
        {name: 'Pending', value: 'pending'},
        {name: 'Provided', value: 'provided'},
        {name: 'In Progress', value: 'in-progress'},
        {name: 'Complete', value: 'complete'},
      ],
      required: false,
    },
    updatedAt: {
      component: 'input',
      helpText: null,
      label: 'Updated At',
      name: 'updatedAt',
      required: true,
      type: 'text',
    },
    userId: {
      component: 'select',
      label: 'User',
      name: 'userId',
      options: {
        lookup: 'user',
        name: 'email',
        value: 'id',
      },
      required: true,
      tabIndex: 2,
    },
  },
  users: {
    createdAt: {
      component: 'input',
      helpText: null,
      label: 'Created At',
      name: 'createdAt',
      required: true,
      type: 'text',
    },
    email: {
      component: 'input',
      helpText: null,
      label: 'Email Address',
      name: 'email',
      required: true,
      type: 'email',
    },
    firstName: {
      component: 'input',
      helpText: null,
      label: 'First Name',
      name: 'firstName',
      required: true,
      type: 'text',
    },
    id: {
      component: 'input',
      helpText: null,
      label: 'Id',
      name: 'id',
      required: true,
      type: 'text',
    },
    lastName: {
      component: 'input',
      helpText: null,
      label: 'Last Name',
      name: 'lastName',
      required: true,
      type: 'text',
    },
    password: {
      component: 'input',
      helpText: null,
      label: 'Password',
      name: 'password',
      required: true,
      type: 'password',
    },
    phone: {
      component: 'input',
      helpText: null,
      label: 'Cell Phone',
      name: 'phone',
      type: 'text',
    },
    role: {
      component: 'select',
      helpText: 'Select a Role',
      label: 'Role',
      name: 'role',
      options: [
        {name: 'User', value: '1'},
        {name: 'Moderator', value: '2'},
        {name: 'Administrator', value: '3'},
        {name: 'Owner', value: '4'},
        {name: 'Super User', value: '5'},
      ],
    },
    status: {
      component: 'select',
      helpText: 'Select a Status',
      label: 'Status',
      name: 'status',
      options: [
        {name: 'Active', value: 'active'},

        {name: 'Probation', value: 'probation'},
        {name: 'Pending', value: 'pending'},
        {name: 'Suspended', value: 'suspended'},
      ],
    },
    updatedAt: {
      component: 'input',
      helpText: null,
      label: 'Updated At',
      name: 'updatedAt',
      required: true,
      type: 'text',
    },
  },
};
