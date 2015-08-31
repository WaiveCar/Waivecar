'use strict';

module.exports = {
  active   : true,
  resource : {
    list : {
      method : 'GET',
      uri    : '/cars'
    },
    show : {
      method : 'GET',
      uri    : '/cars/:id'
    },
    create : {
      method : 'POST',
      uri    : '/cars'
    },
    update : {
      method : 'PUT',
      uri    : '/cars/:id'
    },
    destroy : {
      method : 'DELETE',
      uri    : '/cars/:id'
    }
  },
  views : [
    {
      route       : '/cars',
      type        : 'table',
      name        : 'Cars',
      description : 'WaiveCar Fleet',
      fields      : [ 'id', 'make', 'year', 'manufacturer' ],
      actions     : {
        cancel  : true,
        create  : false,
        update  : true,
        destroy : false
      },
      menus : {
        sidebar : {
          id     : 'list',
          name   : 'Fleet',
          icon   : 'local_taxi',
          parent : null
        }
      }
    },
    {
      route   : '/cars/:id',
      type    : 'form',
      name    : 'Car',
      fields  : [ 'id', 'make', 'year', 'manufacturer', 'phone', 'unitType', 'onstarStatus', 'primaryDriverId', 'primaryDriverUrl', 'url', 'isInPreActivation' ],
      actions : {
        cancel  : true,
        create  : false,
        update  : true,
        destroy : false
      }
    },
    {
      route       : '/maps/cars',
      type        : 'map',
      name        : 'Current Locations',
      description : 'Mapped locations of Fleet',
      actions     : {
        cancel  : true,
        create  : false,
        update  : true,
        destroy : false
      },
      menus : {
        sidebar : {
          id     : 'map-car',
          name   : 'Current Locations',
          icon   : 'map',
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
    make : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Make',
      helpText  : null
    },
    year : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'year',
      helpText  : null
    },
    manufacturer : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'manufacturer',
      helpText  : null
    },
    phone : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'phone',
      helpText  : null
    },
    unitType : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'unitType',
      helpText  : null
    },
    onstarStatus : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'onstarStatus',
      helpText  : null
    },
    primaryDriverId : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'primaryDriverId',
      helpText  : null
    },
    primaryDriverUrl : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'primaryDriverUrl',
      helpText  : null
    },
    url : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'url',
      helpText  : null
    },
    isInPreActivation : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'isInPreActivation',
      helpText  : null
    }
  }
};
