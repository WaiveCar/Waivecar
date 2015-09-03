'use strict';

import React    from 'react';
import { Auth } from 'reach-react';
import { Link } from 'react-router';
import md5      from 'md5';
import NavDrop  from './nav-drop';
import './style.scss';

let menus = {
  account : [
    {
      name : 'My Profile',
      icon : 'account_box',
      href : '/profile'
    },
    {
      name : 'Logout',
      icon : 'exit_to_app',
      href : '/logout'
    }
  ]
};

export default class Nav extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      active   : false,
      dropdown : {
        show : false
      }
    };
    this.nav           = this.nav.bind(this);
    this.closeDropdown = this.closeDropdown.bind(this);
  }

  nav(menu) {
    return menu.map((item, i) => {
      if (item.children) {
        menus[item.name] = item.children;
        return (
          <li key={ i }>
            <a href="javascript:;" onClick={ this.openDropdown.bind(this, item.name) } ref={ item.name }>{ item.name }</a>
          </li>
        );
      }
      return <li><Link to={ item.href }>{ item.name }</Link></li>
    }.bind(this));
  }

  openDropdown(name) {
    if (this.state.dropdown.menu === name) {
      this.closeDropdown();
    } else {
      this.setState({
        dropdown : {
          show : true,
          menu : name
        }
      });
    }
  }

  closeDropdown() {
    this.setState({
      dropdown : {
        show : false,
        menu : null
      }
    });
  }

  dropdown() {
    let { show, menu } = this.state.dropdown;
    if (show) {
      return <NavDrop menu={ menus[menu] } parent={ this.refs[menu] } transit={ this.closeDropdown } />
    }
  }

  render() {
    return (
      <div className="r-navbar">

        <div className="r-nav-brand">
          <img src="/images/brand.svg" alt="WaiveCars" />
        </div>

        <div className="r-nav-profile" onClick={ this.openDropdown.bind(this, 'account') } ref="account">
          <div className="r-nav-profile-image" style={{ background : 'url(//www.gravatar.com/avatar/'+ md5(Auth.user.email) +') center center / cover' }}></div>
          <div className="r-nav-profile-name">
            Hi, { Auth.user.firstName }
          </div>
        </div>

        <ul className="r-nav">
          { this.nav(this.props.menu) }
        </ul>

        { this.dropdown() }

      </div>
    );
  }

}