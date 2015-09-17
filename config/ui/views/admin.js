'use strict';

module.exports = [
  /* ----------------- USER DASHBOARD ------------------ */
  {
    route       : '/book',
    name        : 'Book WaiveCar',
    description : null,
    layout      : {
      rows : [
        {
          columns : [
            {
              type  : 'Wizard',
              steps : [
                {
                  title     : 'Find WaiveCar',
                  component : {
                    name    : 'CarsMap',
                    options : {
                      showCurrentLocation : true
                    }
                  },
                  actions : {
                    previous : 'Previous',
                    next     : 'Confirm Selection',
                    cancel   : 'Cancel'
                  }
                },
                {
                  title     : 'Book WaiveCar',
                  component : {
                    name    : 'CarsSelect',
                    options : {

                    }
                  },
                  actions : {
                    previous : 'Previous',
                    next     : 'Confirm Selection',
                    cancel   : 'Cancel'
                  }
                },
                {
                  title     : 'Confirm Booking',
                  component : {
                    name    : 'WizardBookingsCreate',
                    options : {

                    }
                  },
                  actions : {
                    previous : 'Previous',
                    next     : 'Proceed With Booking',
                    cancel   : 'Cancel'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    menus : {
      sidebar : {
        id     : 'book',
        name   : 'Book WaiveCar',
        icon   : 'dashboard',
        parent : null
      }
    }
  },
  {
    route       : '/dashboard',
    name        : 'My Dashboard',
    description : null,
    layout      : {
      rows : [
        {
          columns : [
            {
              component : {
                name : 'ContentsShow',
                options : {
                  id : 1
                }
              }
            }
          ]
        }
      ]
    },
    menus : {
      sidebar : {
        id     : 'dashboard',
        name   : 'My Dashboard',
        icon   : 'dashboard',
        parent : null
      }
    }
  },
  {
    route       : '/profile',
    name        : 'My Profile',
    description : null,
    layout      : {
      rows : [
        {
          columns : [
            {
              component : 'Profile'
            }
          ]
        }
      ]
    },
    menus : {
      sidebar : {
        id     : 'profile',
        name   : 'My Profile',
        icon   : 'person',
        parent : null
      }
    }
  },
  /* ----------------- ADMIN DASHBOARD ------------------ */
  {
    route       : '/admin',
    name        : 'Dashboard',
    description : null,
    layout      : {
      rows : [
        {
          columns : [
            {
              component : {
                name    : 'UsersChart',
                options : { chartType : 'line', className : 'chart-pink'     }
              }
            },
            {
              component : {
                name    : 'BookingsChart',
                options : { chartType : 'line', className : 'chart-bluegray' }
              }
            },
            {
              component : {
                name    : 'LocationsChart',
                options : { chartType : 'bar',  className : 'chart-info' }
              }
            },
            {
              component : {
                name    : 'CarsChart',
                options : { chartType : 'bar',  className : 'chart-warning' }
              }
            }
          ],
        },
        {
          columns : [
            { component : 'CarsMap' }
          ]
        }
      ]
    },
    menus : {
      sidebar : {
        id     : 'admin',
        name   : 'Dashboard',
        icon   : 'dashboard',
        parent : null
      }
    }
  },
  /* ----------------- BOOKINGS  ------------------ */
  {
    route       : '/contents',
    name        : 'Contents',
    description : null,
    layout      : {
      rows: [
        {
          columns : [
            {
              component : {
                name : 'ContentsList'
              }
            }
          ]
        }
      ]
    },
    menus       : {
      sidebar : {
        id     : 'contents',
        name   : 'Contents',
        icon   : 'event',
        parent : null
      }
    }
  },
  {
    route       : '/contents/create',
    name        : 'Add Content',
    description : null,
    layout      : {
      rows: [
        {
          columns : [
            {
              component : {
                name : 'ContentsCreate'
              }
            }
          ]
        }
      ]
    },
    menus : null
  },
  {
    route       : '/contents/:id',
    name        : 'Content',
    description : null,
    layout      : {
      rows: [
        {
          columns : [
            {
              component : {
                name : 'ContentsShow'
              }
            }
          ]
        }
      ]
    },
    menus : null
  }
];

  // /* ----------------- BOOKINGS  ------------------ */
  // {
  //   route       : '/bookings',
  //   name        : 'Bookings',
  //   description : null,
  //   layout      : 'BookingsList',
  //   menus       : {
  //     sidebar : {
  //       id     : 'bookings',
  //       name   : 'Bookings',
  //       icon   : 'event',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/bookings/create',
  //   name        : 'Add Booking',
  //   description : null,
  //   layout      : { component : 'BookingsCreate' },
  //   menus       : {
  //     sidebar : {
  //       id     : 'bookings-create',
  //       name   : 'Add Booking',
  //       icon   : 'add',
  //       parent : 'bookings'
  //     }
  //   }
  // },
  // {
  //   route       : '/bookings/:id',
  //   name        : 'Booking',
  //   description : null,
  //   layout      : [
  //     [ 'BookingsShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- CARS  ------------------ */
  // {
  //   route       : '/cars',
  //   name        : 'Fleet',
  //   description : null,
  //   layout      : [
  //     [ 'CarsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'cars',
  //       name   : 'Fleet',
  //       icon   : 'directions_car',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/maps/cars',
  //   name        : 'Current Locations',
  //   description : null,
  //   layout      : 'CarsMap',
  //   menus       : {
  //     sidebar : {
  //       id     : 'cars-map',
  //       name   : 'Current Locations',
  //       icon   : 'map',
  //       parent : 'cars'
  //     }
  //   }
  // },
  // {
  //   route       : '/cars/:id',
  //   name        : 'Car',
  //   description : null,
  //   layout      : [
  //     [ 'CarsShow' ],
  //     [ 'BookingsList' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- LICENSES  ------------------ */
  // {
  //   route       : '/licenses',
  //   name        : 'Licenses',
  //   description : null,
  //   layout      : [
  //     [ 'LicensesList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'licenses',
  //       name   : 'Licenses',
  //       icon   : 'picture_in_picture',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/licenses/create',
  //   name        : 'Add License',
  //   description : null,
  //   layout      : [
  //     [ 'LicensesCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'licenses-create',
  //       name   : 'Add License',
  //       icon   : 'add',
  //       parent : 'licenses'
  //     }
  //   }
  // },
  // {
  //   route       : '/licenses/:id',
  //   name        : 'License',
  //   description : null,
  //   layout      : [
  //     [ 'LicensesShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- LOCATIONS  ------------------ */
  // {
  //   route       : '/locations',
  //   name        : 'Locations',
  //   description : null,
  //   layout      : [
  //     [ 'LocationsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'locations',
  //       name   : 'Locations',
  //       icon   : 'place',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/maps/locations',
  //   name        : 'Locations',
  //   description : null,
  //   layout      : 'LocationsMap',
  //   menus       : {
  //     sidebar : {
  //       id     : 'locations-map',
  //       name   : 'View on Map',
  //       icon   : 'map',
  //       parent : 'locations'
  //     }
  //   }
  // },
  // {
  //   route       : '/locations/create',
  //   name        : 'Add Location',
  //   description : null,
  //   layout      : [
  //     [ 'LocationsCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'locations-create',
  //       name   : 'Add Location',
  //       icon   : 'pin_drop',
  //       parent : 'locations'
  //     }
  //   }
  // },
  // {
  //   route       : '/locations/:id',
  //   name        : 'Location',
  //   description : null,
  //   layout      : [
  //     [ 'LocationsShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- LOGS  ------------------ */
  // {
  //   route       : '/logs',
  //   name        : 'Logs',
  //   description : null,
  //   layout      : [
  //     [ 'LogsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'logs',
  //       name   : 'Logs',
  //       icon   : 'confirmation_number',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/logs/:id',
  //   name        : 'Log',
  //   description : null,
  //   layout      : [
  //     [ 'LogsShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- PAYMENTS  ------------------ */
  // {
  //   route       : '/payments',
  //   name        : 'Payments',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'payments',
  //       name   : 'Payments',
  //       icon   : 'payment',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/payments/create',
  //   name        : 'Add Payment',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentsCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'payments-create',
  //       name   : 'Add Payment',
  //       icon   : 'add',
  //       parent : 'payments'
  //     }
  //   }
  // },
  // {
  //   route       : '/payments/:id',
  //   name        : 'Payment',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentsShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- PAYMENT-CARDS  ------------------ */
  // {
  //   route       : '/cards',
  //   name        : 'Cards',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentCardsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'cards',
  //       name   : 'Credit Cards',
  //       icon   : 'payment',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/cards/create',
  //   name        : 'Add Credit Card',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentCardsCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'cards-create',
  //       name   : 'Add Card',
  //       icon   : 'add',
  //       parent : 'cards'
  //     }
  //   }
  // },
  // {
  //   route       : '/cards/:id',
  //   name        : 'Credit Card',
  //   description : null,
  //   layout      : [
  //     [ 'PaymentCardsShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- USERS  ------------------ */
  // {
  //   route       : '/users',
  //   name        : 'Users',
  //   description : null,
  //   layout      : [
  //     [ 'UsersList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'users',
  //       name   : 'Users',
  //       icon   : 'people',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/users/create',
  //   name        : 'Add User',
  //   description : null,
  //   layout      : [
  //     [ 'UsersCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'users-create',
  //       name   : 'Add User',
  //       icon   : 'person_add',
  //       parent : 'users'
  //     }
  //   }
  // },
  // {
  //   route       : '/users/:id',
  //   name        : 'User',
  //   description : null,
  //   layout      : [
  //     [ 'UsersShow' ]
  //   ],
  //   menus : null
  // },
  // /* ----------------- VIEWS  ------------------ */
  // {
  //   route       : '/views',
  //   name        : 'Views',
  //   description : null,
  //   layout      : [
  //     [ 'ViewsList' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'views',
  //       name   : 'Views',
  //       icon   : 'view_quilt',
  //       parent : null
  //     }
  //   }
  // },
  // {
  //   route       : '/views/create',
  //   name        : 'Add View',
  //   description : null,
  //   layout      : [
  //     [ 'ViewsCreate' ]
  //   ],
  //   menus : {
  //     sidebar : {
  //       id     : 'views-create',
  //       name   : 'Add View',
  //       icon   : 'view_module',
  //       parent : 'views'
  //     }
  //   }
  // },
  // {
  //   route       : '/views/:id',
  //   name        : 'View',
  //   description : null,
  //   layout      : [
  //     [ 'ViewsShow' ]
  //   ],
  //   menus : null
  // }
//];
