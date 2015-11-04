'use strict';

import React                      from 'react';
import Reach, { relay }           from 'bento';
import { templates, menu, views } from 'bento-ui';
import policies                   from 'policies';
import Sidebar                    from './sidebar';
import Header                     from './header';

class AppTemplate extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'app');
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  header() {
    let { title, description, display } = this.state.app;
    if (display) {
      return (
        <h1>
          { title }
          <small>
            { description }
          </small>
        </h1>
      );
    }
  }

  render() {
    return (
      <div id="app">
        <Header />
        <Sidebar route={ this.props.location.pathname } />
        <div id="content">
          <div className="content-wrapper">
            { this.header() }
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
        path      : '/profile',
        component : require('../../views/app/profile'),
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
    title     : 'Logout',
    icon      : 'highlight_off',
    path      : '/logout',
    parent    : null,
    locations : [ 'sidebar-account' ]
  },
  {
    title     : 'Book a Car',
    icon      : 'directions_car',
    path      : '/booking',
    parent    : null,
    locations : [ 'sidebar-user' ]
  },
  {
    title     : 'Past Rides',
    icon      : 'navigation',
    path      : '/past-rides',
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
