import md5      from 'md5';
import React    from 'react';
import { Link } from 'react-router';
import { auth } from 'bento';
import NavDrop  from './nav-drop';

/**
 * @property menus
 * @type     Array
 */
let menus = {
  account : [
    {
      name : 'My Profile',
      icon : 'account_box',
      href : '/profile',
      role : 'user'
    },
    {
      name : 'Admin',
      icon : 'dashboard',
      href : '/dashboard',
      role : 'admin'
    },
    {
      name : 'Logout',
      icon : 'exit_to_app',
      href : '/logout',
      role : 'user'
    }
  ]
};

module.exports = class Nav extends React.Component {

  /**
   * @constructor
   */
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

  /**
   * @method nav
   */
  nav(menu) {
    return menu.map((item, i) => {
      if (item.role === 'admin' && !auth.user().hasAccess('admin')) {
        return;
      }
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

  /**
   * @method openDropdown
   */
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

  /**
   * @method closeDropdown
   */
  closeDropdown() {
    this.setState({
      dropdown : {
        show : false,
        menu : null
      }
    });
  }

  /**
   * @method dropdown
   * @return {NavDrop}
   */
  dropdown() {
    let { show, menu } = this.state.dropdown;
    if (show) {
      return <NavDrop menu={ menus[menu] } parent={ this.refs[menu] } transit={ this.closeDropdown } />
    }
  }

  /**
   * Render profile if there is an authenticated user signed into the system.
   * @method profile
   * @return {Mixed}
   */
  profile() {
    if (!auth.check()) {
      return;
    }
    return (
      <div className="r-nav-profile" onClick={ this.openDropdown.bind(this, 'account') } ref="account">
        <div className="r-nav-profile-image" style={{ background : auth.user.email ? `url(//www.gravatar.com/avatar/${ md5(auth.user.email) }) center center / cover` : '#fff' }}></div>
        <div className="r-nav-profile-name">
          Hi, { auth.user.firstName }
        </div>
      </div>
    );
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="r-navbar">
        <div className="r-nav-brand">
          <Link to="/">
            <img src="/images/brand.svg" />
          </Link>
        </div>
        { this.profile() }
        <ul className="r-nav">
          { this.nav(this.props.menu) }
        </ul>
        { this.dropdown() }
      </div>
    );
  }

}
