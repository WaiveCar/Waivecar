'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import { Link } from 'react-router';
import md5      from 'md5';

let user = Reach.Auth.user;
let nav  = [
  {
    name : 'Profile',
    path : '/profile',
    icon : 'person'
  },
  {
    name : 'Past Rides',
    path : '/past-rides',
    icon : 'directions_car'
  },
  {
    name : 'Invoices',
    path : '/invoices',
    icon : 'description'
  }
];

export default class Sidebar extends React.Component {

  getLink(link, i) {
    return (
      <li key={ i }>
        <Link to={ link.path } className="nav-link animated fadeInDown">
          <i className="material-icons" role={ link.name }>{ link.icon }</i>
          { link.name }
        </Link>
      </li>
    );
  }

  render() {
    return (
      <div id="sidebar">
        <div className="sidebar-meta">
          <div className="sidebar-avatar animated flipInX">
            <div 
              className = "sidebar-avatar-img" 
              style     = {{ background : 'url(//www.gravatar.com/avatar/'+ md5(user.email) +'?s=125) center center / cover' }}
            />
          </div>
          <div className="sidebar-name animated flipInY">
            <small>Account</small>
            <span>{ user.firstName } { user.lastName }</span>
          </div>
        </div>
        <ul>
          { nav.map(this.getLink) }
        </ul>
      </div>
    );
  }

}