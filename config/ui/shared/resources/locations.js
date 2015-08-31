'use strict';

module.exports = {
  active   : true,
  resource : {
    name : 'locations',
    store : {
      key    : 'location',
      method : 'POST',
      uri    : '/locations'
    },
    index : {
      key    : 'locations',
      method : 'GET',
      uri    : '/locations'
    },
    show : {
      key    : 'location',
      method : 'GET',
      uri    : '/locations/:id'
    },
    update : {
      key    : 'location',
      method : 'PUT',
      uri    : '/locations/:id'
    },
    delete : {
      key    : 'location',
      method : 'DELETE',
      uri    : '/locations/:id'
    }
  },
  views : [
    {
      route       : '/locations',
      type        : 'table',
      name        : 'Known Locations',
      description : 'Charging Stations and Points of Interest',
      fields      : [ 'id', 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
      actions     : {
        cancel : true,
        create : true,
        update : true,
        delete : true
      },
      menus : {
        sidebar : {
          id     : 'list',
          name   : 'Known Locations',
          icon   : 'local_gas_station',
          parent : null
        }
      }
    },
    {
      route   : '/locations/create',
      type    : 'form',
      name    : 'Add New Location',
      fields  : [ 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
      actions : {
        cancel : true,
        create : true,
        update : false,
        delete : false
      },
      menus : {
        sidebar : {
          id     : 'create',
          name   : 'Add Locations',
          icon   : 'plus',
          parent : 'list'
        }
      }
    },
    {
      route   : '/locations/:id',
      type    : 'form',
      name    : 'Location',
      fields  : [ 'id', 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
      actions : {
        cancel : true,
        create : false,
        update : true,
        delete : true
      }
    },
    {
      route       : '/maps/locations',
      type        : 'map',
      name        : 'Known Locations',
      description : 'Charging Stations and Points of Interest',
      actions     : {
        cancel : true,
        create : true,
        update : true,
        delete : true
      },
      menus : {
        sidebar : {
          id     : 'map',
          name   : 'Known Locations',
          icon   : 'local_gas_station',
          parent : 'list'
        }
      }
    }
  ],
  fields : {
    id : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Id',
      helpText  : null
    },
    type : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Type',
      helpText  : null
    },
    name : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Name',
      helpText  : null
    },
    description : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Description',
      helpText  : 'Phone Number, Opening Hours, etc.'
    },
    latitude : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Latitude',
      helpText  : null
    },
    longitude : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Longitude',
      helpText  : null
    },
    address : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Address',
      helpText  : null
    }
  }
};
