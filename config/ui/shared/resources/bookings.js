'use strict';

module.exports = {
  active   : true,
  resource : {
    name : 'bookings',
    store : {
      key    : 'booking',
      method : 'POST',
      uri    : '/bookings'
    },
    index : {
      key    : 'bookings',
      method : 'GET',
      uri    : '/bookings'
    },
    show : {
      key    : 'booking',
      method : 'GET',
      uri    : '/bookings/:id'
    },
    update : {
      key    : 'booking',
      method : 'PUT',
      uri    : '/bookings/:id'
    },
    delete : {
      key    : 'booking',
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
        cancel : true,
        create : true,
        update : true,
        delete : true
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
        cancel : true,
        create : true,
        update : false,
        delete : false
      }
    },
    {
      route   : '/bookings/:id',
      type    : 'form',
      name    : 'Booking',
      fields  : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
      actions : {
        cancel : true,
        create : false,
        update : true,
        delete : true
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
