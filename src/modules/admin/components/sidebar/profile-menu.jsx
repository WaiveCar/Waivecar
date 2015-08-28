import React    from 'react';
import Reach    from 'reach-react';
import md5      from 'md5';
import NavLink  from './nav-link';
import './style.scss';

export default class ProfileMenu extends React.Component {

  constructor(...args) {
    super(...args);
    this._showMenu = this._showMenu.bind(this);
  }

  /**
   * Set the menu items, this should end up being dynamic.
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      open   : 'profile-nav',
      isOpen : false,
      menu   : [
        {
          name     : 'View Profile',
          icon     : 'perm_identity',
          href     : '/#/profile',
          isActive : false
        },
        {
          name     : 'Privacy Settings',
          icon     : 'settings_input_antenna',
          href     : '/#/profile/privacy',
          isActive : false
        },
        {
          name     : 'Settings',
          icon     : 'settings',
          href     : '/#/profile/settings',
          isActive : false
        },
        {
          name     : 'Logout',
          icon     : 'power_settings_new',
          href     : '/#/logout',
          isActive : false
        }
      ]
    });
  }

  /**
   * Opens the users profile menu.
   * @method _showMenu
   */
  _showMenu() {
    this.setState({
      open   : this.state.isOpen ? 'profile-nav' : 'profile-nav open',
      isOpen : this.state.isOpen ? false : true
    });
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="profile-menu">
        <button onClick={ this._showMenu }>
          <div className="profile-avatar">
            <div className="image" style={{ background : 'url(http://www.gravatar.com/avatar/'+ md5(Reach.Auth.user.email) +') center center / cover' }}></div>
          </div>
          <div className="profile-info">
            { Reach.Auth.user.firstName } { Reach.Auth.user.lastName }
          </div>
          <div className="profile-menu">
            Account
            <i className="material-icons" role="open_menu">
              { this.state.isOpen ? 'arrow_drop_up' : 'arrow_drop_down' }
            </i>
          </div>
        </button>
        <div className={ this.state.open }>
        {
          this.state.menu.map(function (link, i) {
            return <NavLink key={ i } name={ link.name } icon={ link.icon } href={ link.href } isActive={ link.isActive } />
          })
        }
        </div>
      </div>
    );
  }

}