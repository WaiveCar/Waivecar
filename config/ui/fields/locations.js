module.exports = {
  id : {
    name      : 'id',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Id',
    helpText  : null
  },
  type : {
    name      : 'type',
    component : 'select',
    required  : true,
    label     : 'Type',
    helpText  : null,
    options   : [
      { name : 'Charging Station', value : 'station' },
      { name : 'Valet',            value : 'valet' },
      { name : 'HomeBase',         value : 'homebase' },
      { name : 'Item Of Interest', value : 'item-of-interest' }
    ]
  },
  name : {
    name      : 'name',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Name',
    helpText  : null
  },
  description : {
    name      : 'description',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Description',
    helpText  : 'Phone Number, Opening Hours, etc.'
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
  address : {
    name      : 'address',
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Address',
    helpText  : null
  }
};
