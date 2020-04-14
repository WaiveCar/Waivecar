import React                      from 'react';
import Reach, { relay }           from 'bento';
import { templates, menu, views } from 'bento-ui';
import policies                   from 'policies';
import Sidebar                    from './sidebar';
import Header                     from './header';

class AppTemplate extends React.Component {

  render() {
    return (
      <div id="app">
        <Header />
        <Sidebar route={ this.props.location.pathname } />
        <div id="content">
          <div className="content-wrapper">
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }

}

// ### Register Template

templates.register('app', {
  component : AppTemplate,
  onEnter   : policies.isAuthenticated,
  getChildRoutes(state, done) {
    done(null, [

      // ### User Paths

      {
        path      : '/my-rides',
        component : require('../../views/app/user/rides'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/profile',
        component : require('../../views/app/user/profile'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/license',
        component : require('../../views/app/user/profile/license'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/password',
        component : require('../../views/app/user/profile/password'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/cards',
        component : require('../../views/app/user/profile/cards'),
        onEnter   : policies.isAuthenticated
      },

      // ### Admin Paths

      {
        path      : '/dashboard',
        component : require('../../views/app/admin/dashboard'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/cars/:id',
        component : require('../../views/app/admin/cars/show'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/cars',
        component : require('../../views/app/admin/cars'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/bookings/:id',
        component : require('../../views/app/admin/bookings/show'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/bookings',
        component : require('../../views/app/admin/bookings'),
        onEnter   : policies.isAdministrator
      },
        /*
      {
        path      : '/tickets/:id',
        component : require('../../views/app/admin/tickets/show'),
        onEnter   : policies.isAdministrator
      },
      */
      {
        path      : '/tickets',
        component : require('../../views/app/admin/tickets'),
        onEnter   : policies.isWaiveAdmin
      },
      {
        path      : '/magic/:act',
        component : require('../../views/app/admin/cars/magic'),
        onEnter   : policies.isAdministrator
      },
      /*
      {
        path      : '/admin/waitlist',
        component : require('../../views/app/admin/waitlist'),
        onEnter   : policies.isAdministrator
      },
      */
      {
        path      : '/admin/waivework/signups',
        component : require('../../views/app/admin/waivework/waitlist'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/admin/waivework/insurance',
        component : require('../../views/app/admin/waivework/insurance-quotes'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/admin/waivework/car-prep',
        component : require('../../views/app/admin/waivework/car-prep'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/users',
        component : require('../../views/app/admin/users'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/users/:id',
        component : require('../../views/app/admin/users/show'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/locations',
        component : require('../../views/app/admin/locations'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/locations/create',
        component : require('../../views/app/admin/locations/create'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/locations/:id',
        component : require('../../views/app/admin/locations/update'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/waivepark',
        component : require('../../views/app/admin/waivepark'),
        onEnter   : policies.isAdministrator
      }, 
      {
        path      : '/waivepark/:id',
        component : require('../../views/app/admin/waivepark/show'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/organizations',
        component : require('../../views/app/admin/organizations/index'),
        onEnter   : policies.isAdministrator
      },
      {
        path      : '/organizations/:id',
        component : require('../../views/app/admin/organizations/show'),
        onEnter   : policies.isAdministrator
      }
      
    ].concat(views.getRoutes('app')));
  }
});

// ### App Menus

let order = 2;
[
  {
    title     : 'Profile',
    icon      : 'account_box',
    path      : '/profile',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'License',
    icon      : 'assignment_ind',
    path      : '/account/license',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'Password',
    icon      : 'security',
    path      : '/account/password',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'Cards',
    icon      : 'credit_card',
    path      : '/account/cards',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'Logout',
    icon      : 'highlight_off',
    path      : '/logout',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'My Rides',
    icon      : 'navigation',
    path      : '/my-rides',
    parent    : null,
    locations : [ 'sidebar-user' ]
  },
  /*
  {
    title     : 'Book a Car',
    icon      : 'directions_car',
    path      : '/booking',
    parent    : null,
    locations : [ 'sidebar-user' ]
  },
  {
    title     : 'Invoices',
    icon      : 'receipt',
    path      : '/invoices',
    parent    : null,
    locations : [ 'sidebar-user' ]
  },
  */

  // ### Admin Routes

  {
    title     : 'Users',
    icon      : 'group',
    path      : '/users',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'Bookings',
    icon      : 'insert_invitation',
    path      : '/bookings',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  /*
  {
    title     : 'Waitlist',
    icon      : 'list',
    path      : '/admin/waitlist',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  */
  {
    title     : 'WaiveWork Signups',
    icon      : 'building',
    path      : '/admin/waivework/signups',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'Insurance Quotes',
    icon      : 'building',
    path      : '/admin/waivework/insurance',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'WaiveWork Car Prep',
    icon      : 'building',
    path      : '/admin/waivework/car-prep',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'Cars',
    icon      : 'directions_car',
    path      : '/cars',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'Tickets',
    icon      : 'list',
    path      : '/tickets',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++,
    waiveAdmin: true,
  },
  {
    title     : 'Locations',
    icon      : 'location_on',
    path      : '/locations',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'Organizations',
    icon      : 'location_on',
    path      : '/organizations',
    parent    : null,
    locations : [ 'sidebar' ],
    order     : order++
  },
  {
    title     : 'WaivePark',
    icon      : 'location_on',
    path      : '/waivepark',
    locations : [/*'sidebar'*/],
    order     : order++
  }
].forEach(val => menu.add(val));
