'use strict';

import React           from 'react';
import Reach, { auth } from 'reach-react';
import { Link }        from 'react-router';
import { menu }        from 'reach-ui';
import md5             from 'md5';

let nav  = [
];

export default class Sidebar extends React.Component {

  getLink(link, i) {
    return (
      <li key={ i } className={ link.parent ? "has-parent" : "parent" }>
        <Link to={ link.path } className="nav-link animated fadeInDown">
          <i className="material-icons" role={ link.title }>{ link.icon }</i>
          { link.title }
        </Link>
      </li>
    );
  }

  admin() {
    if (auth.user.role === 'admin') {
      return (
        <ul>
          <li style={{ borderBottom : '1px solid #f4f4f4', color : '#363636', fontSize : 16, fontWeight : 500, margin : '15px 0 6px', padding : '0 24px 6px' }}>
            Admin
          </li>
          { menu.get('sidebar').map(this.getLink) }
        </ul>
      );
    }
  }

  render() {
    return (
      <div id="sidebar">
        <div className="sidebar-meta">
          <div className="sidebar-avatar animated flipInX">
            <div
              className = "sidebar-avatar-img"
              style     = {{ background : auth.user.email ? `url(//www.gravatar.com/avatar/${ md5(auth.user.email) }) center center / cover` : '#fff' }}
            />
          </div>
          <div className="sidebar-name animated flipInY">
            <small>Account</small>
            <span>{ auth.user.firstName } { auth.user.lastName }</span>
          </div>
        </div>
        <ul>
          { nav.map(this.getLink) }
        </ul>
        { this.admin() }
      </div>
    );
  }

}
