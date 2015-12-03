'use strict';

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
      {
        path      : '/my-rides',
        component : require('../../views/app/rides'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/profile',
        component : require('../../views/app/profile'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/license',
        component : require('../../views/app/profile/license'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/password',
        component : require('../../views/app/profile/password'),
        onEnter   : policies.isAuthenticated
      },
      {
        path      : '/account/cards',
        component : require('../../views/app/profile/cards'),
        onEnter   : policies.isAuthenticated
      }
    ].concat(views.getRoutes('app')));
  }
});

// ### App Menus

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
  }
].forEach(val => menu.add(val));
