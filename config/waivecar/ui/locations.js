'use strict';

module.exports = {
  active      : true,
  displayName : 'Charging Stations',
  icon        : 'local_gas_station',
  path        : '/locations',
  views       : [
    {
      type   : 'list',
      name   : 'Locations',
      uri    : '/locations',
      form   : 'location',
      fields : [ 'id', 'type', 'name', 'description', 'latitude', 'longitude', 'address' ]
    },
    {
      type        : 'crud',
      childRoutes : [
        {
          name       : 'Add Location',
          path       : '/new',
          type       : 'form',
          categories : [
            {
              name   : 'Add Location',
              fields : [ 'type', 'name', 'description', 'latitude', 'longitude', 'address' ]
            }
          ]
        }
      ]
    }
  ],
  forms : {
    location : {
      id : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      type : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      name : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      description : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      latitude : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      longitude : {
        component : 'input',
        type      : 'text',
        required  : true
      },
      address : {
        component : 'input',
        type      : 'text',
        required  : true
      }
    }
  }
};
