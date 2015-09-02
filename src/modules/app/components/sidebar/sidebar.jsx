import React       from 'react';
import ProfileMenu from './profile-menu';
import NavLink     from './nav-link';
import UI          from '../../ui';
import './style.scss';

export default class Sidebar extends React.Component {
  render() {
    return (
      <div id="sidebar" className={ this.props.state }>
        <div className="sidebar-inner">
          <ProfileMenu />
          {
            UI.menu.sidebar.map(function (link, i) {
              return <NavLink key={ i } name={ link.name } icon={ link.icon } href={ link.href } isActive={ link.isActive } />
            })
          }
        </div>
      </div>
    );
  }
}