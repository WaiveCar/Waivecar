'use strict';

module.exports = [
  /* ----------------- DASHBOARD ------------------ */
  {
    route       : '/dashboard2',
    name        : 'Dashboard',
    description : null,
    layout      : [
      [
        { component : 'UsersChart',     options : { chartType : 'line', className : 'chart-pink'     } },
        { component : 'BookingsChart',  options : { chartType : 'line', className : 'chart-bluegray' } },
        { component : 'LocationsChart', options : { chartType : 'bar',  className : 'chart-info'     } },
        { component : 'CarsChart',      options : { chartType : 'bar',  className : 'chart-warning'  } }
      ],
      [ 'CarsMap' ]
    ],
    menus : {
      sidebar : {
        id     : 'dashboard',
        name   : 'Dashboard',
        icon   : 'dashboard',
        parent : null
      }
    }
  },
  /* ----------------- BOOKINGS  ------------------ */
  {
    route       : '/bookings',
    name        : 'Bookings',
    description : null,
    layout      : 'BookingsList',
    menus       : {
      sidebar : {
        id     : 'bookings',
        name   : 'Bookings',
        icon   : 'event',
        parent : null
      }
    }
  },
  {
    route       : '/bookings/create',
    name        : 'Add Booking',
    description : null,
    layout      : { component : 'BookingsCreate' },
    menus       : {
      sidebar : {
        id     : 'bookings-create',
        name   : 'Add Booking',
        icon   : 'add',
        parent : 'bookings'
      }
    }
  },
  {
    route       : '/bookings/:id',
    name        : 'Booking',
    description : null,
    layout      : [
      [ 'BookingsShow' ]
    ],
    menus : null
  },
  /* ----------------- CARS  ------------------ */
  {
    route       : '/cars',
    name        : 'Fleet',
    description : null,
    layout      : [
      [ 'CarsList' ]
    ],
    menus : {
      sidebar : {
        id     : 'cars',
        name   : 'Fleet',
        icon   : 'directions_car',
        parent : null
      }
    }
  },
  {
    route       : '/maps/cars',
    name        : 'Current Locations',
    description : null,
    layout      : 'CarsMap',
    menus       : {
      sidebar : {
        id     : 'cars-map',
        name   : 'Current Locations',
        icon   : 'map',
        parent : 'cars'
      }
    }
  },
  {
    route       : '/cars/:id',
    name        : 'Car',
    description : null,
    layout      : [
      [ 'CarsShow' ],
      [ 'BookingsList' ]
    ],
    menus : null
  },
  /* ----------------- LOCATIONS  ------------------ */
  {
    route       : '/locations',
    name        : 'Locations',
    description : null,
    layout      : [
      [ 'LocationsList' ]
    ],
    menus : {
      sidebar : {
        id     : 'locations',
        name   : 'Locations',
        icon   : 'place',
        parent : null
      }
    }
  },
  {
    route       : '/maps/locations',
    name        : 'Locations',
    description : null,
    layout      : 'LocationsMap',
    menus       : {
      sidebar : {
        id     : 'locations-map',
        name   : 'View on Map',
        icon   : 'map',
        parent : 'locations'
      }
    }
  },
  {
    route       : '/locations/create',
    name        : 'Add Location',
    description : null,
    layout      : [
      [ 'LocationsCreate' ]
    ],
    menus : {
      sidebar : {
        id     : 'locations-create',
        name   : 'Add Location',
        icon   : 'pin_drop',
        parent : 'locations'
      }
    }
  },
  {
    route       : '/locations/:id',
    name        : 'Location',
    description : null,
    layout      : [
      [ 'LocationsShow' ]
    ],
    menus : null
  },
  /* ----------------- USERS  ------------------ */
  {
    route       : '/users',
    name        : 'Users',
    description : null,
    layout      : [
      [ 'UsersList' ]
    ],
    menus : {
      sidebar : {
        id     : 'users',
        name   : 'Users',
        icon   : 'people',
        parent : null
      }
    }
  },
  {
    route       : '/users/create',
    name        : 'Add User',
    description : null,
    layout      : [
      [ 'UsersCreate' ]
    ],
    menus : {
      sidebar : {
        id     : 'users-create',
        name   : 'Add User',
        icon   : 'person_add',
        parent : 'users'
      }
    }
  },
  {
    route       : '/users/:id',
    name        : 'User',
    description : null,
    layout      : [
      [ 'UsersShow' ]
    ],
    menus : null
  },
  /* ----------------- VIEWS  ------------------ */
  {
    route       : '/views',
    name        : 'Views',
    description : null,
    layout      : [
      [ 'ViewsList' ]
    ],
    menus : {
      sidebar : {
        id     : 'views',
        name   : 'Views',
        icon   : 'view_quilt',
        parent : null
      }
    }
  },
  {
    route       : '/views/create',
    name        : 'Add View',
    description : null,
    layout      : [
      [ 'ViewsCreate' ]
    ],
    menus : {
      sidebar : {
        id     : 'views-create',
        name   : 'Add View',
        icon   : 'view_module',
        parent : 'views'
      }
    }
  },
  {
    route       : '/views/:id',
    name        : 'View',
    description : null,
    layout      : [
      [ 'ViewsShow' ]
    ],
    menus : null
  }
];
