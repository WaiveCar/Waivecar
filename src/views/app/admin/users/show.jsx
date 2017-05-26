import React from 'react';

// ### Components

import UserDetails from './user-details';
import UserLicense from './user-license';
import Logs from '../../components/logs';
import NotesList from '../components/notes/list';

module.exports = class AdminUsersView extends React.Component {
  render() {
    return (
      <div id="users">
        <UserDetails id={ this.props.params.id } />
        <UserLicense id={ this.props.params.id } />
        <Logs userId={ this.props.params.id } />

        <NotesList type='user' identifier={ this.props.params.id }></NotesList>
      </div>
    );
  }
};
