module.exports = {
  id : {
    name      : 'id',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  userId : {
    name      : 'userId',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'User',
    helpText  : null
  },
  isAvailable : {
    name      : 'isAvailable',
    component : 'checkbox',
    required  : true,
    label     : 'available',
    helpText  : null
  },
  isLocked : {
    name      : 'isLocked',
    component : 'checkbox',
    required  : true,
    label     : 'Locked',
    helpText  : null
  },
  isImmobilized : {
    name      : 'isImmobilized',
    component : 'checkbox',
    required  : true,
    label     : 'Immobilized',
    helpText  : null
  },
  isIgnitionOn : {
    name      : 'isIgnitionOn',
    component : 'checkbox',
    type      : 'text',
    required  : true,
    label     : 'Ignition',
    helpText  : null
  },
  isKeySecure : {
    name      : 'isKeySecure',
    component : 'checkbox',
    type      : 'text',
    required  : true,
    label     : 'Key Secure',
    helpText  : null
  },
  isChargeCardSecure : {
    name      : 'isChargeCardSecure',
    component : 'checkbox',
    type      : 'text',
    required  : true,
    label     : 'Charge Card Secure',
    helpText  : null
  },
  isCharging : {
    name      : 'isCharging',
    component : 'checkbox',
    required  : true,
    label     : 'Charging',
    helpText  : null
  },
  isQuickCharging : {
    name      : 'isQuickCharging',
    component : 'checkbox',
    required  : true,
    label     : 'Quick Charging',
    helpText  : null
  },
  isOnChargeAdapter : {
    name      : 'isOnChargeAdapter',
    component : 'checkbox',
    required  : true,
    label     : 'On Charge Adapter',
    helpText  : null
  },
  isWaivework : {
    name      : 'isWaivework',
    component : 'checkbox',
    required  : true,
    label     : 'Is Waive Work',
    helpText  : null
  },
  isParked : {
    name      : 'isParked',
    component : 'checkbox',
    required  : true,
    label     : 'Parked',
    helpText  : null
  },
  make : {
    name      : 'make',
    component : 'select',
    type      : 'text',
    required  : true,
    label     : 'Make',
    helpText  : null,
    options   : [
      { name : 'Hyundai',   value : 'Hyundai' },
      { name : 'Chevrolet', value : 'Chevrolet' }
    ]
  },
  model : {
    name      : 'model',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Model',
    helpText  : null
  },
  year : {
    name      : 'year',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Year',
    helpText  : null
  },
  manufacturer : {
    name      : 'manufacturer',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Manufacturer',
    helpText  : null
  },
  license : {
    name      : 'license',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'License',
    helpText  : null
  },
  vin : {
    name      : 'vin',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'VIN',
    helpText  : null
  },
  fileId : {
    name      : 'fileId',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Photo',
    helpText  : null
  },
  latitude : {
    name      : 'latitude',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Latitude',
    helpText  : null
  },
  longitude : {
    name      : 'longitude',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Longitude',
    helpText  : null
  },
    /*
  hdop : {
    name      : 'hdop',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'HDOP',
    helpText  : null
  },
  */
  locationQuality : {
    name      : 'locationQuality',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : ':ocation Quality',
    helpText  : null
  },
  distanceSinceLastRead : {
    name      : 'distanceSinceLastRead',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Distance Since Last Read',
    helpText  : null
  },
  currentSpeed : {
    name      : 'currentSpeed',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Speed',
    helpText  : null
  },
  calculatedSpeed : {
    name      : 'calculatedSpeed',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Calculated Speed',
    helpText  : null
  },
  charge : {
    name      : 'charge',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Charge',
    helpText  : null
  },
  lockLastCommand : {
    name      : 'lockLastCommand',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Lock Command',
    helpText  : null
  },
  bluetooth : {
    name      : 'bluetooth',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Bluetooth',
    helpText  : null
  },
  alarmInput : {
    name      : 'alarmInput',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Alarm Input',
    helpText  : null
  },
  mileageSinceImmobilizerUnlock : {
    name      : 'mileageSinceImmobilizerUnlock',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Mileage Since Last Unlock',
    helpText  : null
  },
  totalMileage : {
    name      : 'totalMileage',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Total Mileage',
    helpText  : null
  },
  boardVoltage : {
    name      : 'boardVoltage',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Board Voltage',
    helpText  : null
  },
  range : {
    name      : 'range',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Current Range',
    helpText  : null
  },
  positionUpdatedAt : {
    name      : 'positionUpdatedAt',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Position Update',
    helpText  : null
  },
  lastServiceAt : {
    name      : 'lastServiceAt',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Service',
    helpText  : null
  },
  comments : {
    name      : 'comments',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Comments',
    helpText  : null
  },
  createdAt : {
    name      : 'createdAt',
    component : 'input',
    type      : 'date',
    required  : true,
    label     : 'Created At',
    helpText  : null
  },
  updatedAt : {
    name      : 'updatedAt',
    component : 'input',
    type      : 'date',
    required  : true,
    label     : 'Updated At',
    helpText  : null
  }
};
