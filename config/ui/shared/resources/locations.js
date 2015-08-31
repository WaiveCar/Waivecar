'use strict';

module.exports = {
  active   : true,
  resource : {
    list : {
      method : 'GET',
      uri    : '/locations'
    },
    show : {
      method : 'GET',
      uri    : '/locations/:id'
    },
    create : {
      method : 'POST',
      uri    : '/locations'
    },
    update : {
      method : 'PUT',
      uri    : '/locations/:id'
    },
    destroy : {
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
        cancel  : true,
        create  : true,
        update  : true,
        destroy : true
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
      route   : '/locations/new',
      type    : 'form',
      name    : 'Add New Location',
      fields  : [ 'type', 'name', 'description', 'latitude', 'longitude', 'address' ],
      actions : {
        cancel  : true,
        create  : true,
        update  : false,
        destroy : false
      },
      menus : {
        sidebar : {
          id     : 'new',
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
        cancel  : true,
        create  : false,
        update  : true,
        destroy : true
      }
    },
    {
      route       : '/maps/locations',
      type        : 'map',
      name        : 'Known Locations',
      description : 'Charging Stations and Points of Interest',
      actions     : {
        cancel  : true,
        create  : true,
        update  : true,
        destroy : true
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
