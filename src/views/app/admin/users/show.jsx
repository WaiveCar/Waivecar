import React from 'react';

// ### Components

import UserDetails from './components/user-details';
import UserLicense from './components/user-license';

module.exports = class AdminUsersView extends React.Component {
  render() {
    return (
      <div id="users">
        <UserDetails id={ this.props.params.id } />
        <UserLicense id={ this.props.params.id } />
      </div>
    );
  }
};
