import React from 'react';
import {api} from 'bento';
import UserDetails from './user-details';
import Stats from './stats';
import UserLicense from './user-license';
import UsersEvents from './user-events.jsx';
import Logs from '../../components/logs';
import NotesList from '../components/notes/list';
import UserParking       from '../../components/user/user-parking/user-parking';

module.exports = class AdminUsersView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
    }
  }
  componentDidMount() {
    api.get(`/users/${this.props.params.id}/stats`, (err, stats) => {
      this.setState({stats});
    });
  }

  render() {
    return (
      <div id="users">
        <Stats stats={this.state.stats} />
        <UserDetails id={ this.props.params.id } />
        <UserParking admin={true} userId={ this.props.params.id }/>
        <UserLicense id={ this.props.params.id } />
        <UsersEvents id={ this.props.params.id } />
        <Logs userId={ this.props.params.id } />
        <NotesList type='user' identifier={ this.props.params.id }></NotesList>
      </div>
    );
  }
};

