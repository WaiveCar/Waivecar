'use strict';

module.exports = {
  active   : true,
  resource : {
    list : {
      method : 'GET',
      uri    : '/bookings'
    },
    show : {
      method : 'GET',
      uri    : '/bookings/:id'
    },
    create : {
      method : 'POST',
      uri    : '/bookings'
    },
    update : {
      method : 'PUT',
      uri    : '/bookings/:id'
    },
    destroy : {
      method : 'DELETE',
      uri    : '/bookings/:id'
    }
  },
  views : [
    {
      route       : '/bookings',
      type        : 'table',
      name        : 'Bookings',
      description : null,
      fields      : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
      actions     : {
        cancel  : true,
        create  : true,
        update  : true,
        destroy : true
      },
      menus : {
        sidebar : {
          id     : 'list',
          name   : 'Bookings',
          icon   : 'event',
          parent : null
        }
      }
    },
    {
      route   : '/bookings/new',
      type    : 'form',
      name    : 'Booking',
      fields  : [ 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
      actions : {
        cancel  : true,
        create  : true,
        update  : false,
        destroy : false
      }
    },
    {
      route   : '/bookings/:id',
      type    : 'form',
      name    : 'Booking',
      fields  : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
      actions : {
        cancel  : true,
        create  : false,
        update  : true,
        destroy : true
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
    customerId : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'User',
      helpText  : null
    },
    carId : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Car',
      helpText  : null
    },
    paymentId : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Payment',
      helpText  : null
    },
    filesId : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Photos',
      helpText  : null
    },
    state : {
      component : 'input',
      type      : 'text',
      required  : true,
      label     : 'Status',
      helpText  : null
    }
  }
};
