import React from 'react';

// ### Components

import UserDetails from './user-details';
import UserLicense from './user-license';

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
