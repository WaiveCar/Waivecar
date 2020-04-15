import React from 'react';
import UserDetails from './user-details';
import Stats from './stats';
import UserLicense from './user-license';
import UsersEvents from './user-events.jsx';
import Logs from '../../components/logs';
import NotesList from '../components/notes/list';
import UserParking       from '../../components/user/user-parking/user-parking';
import { api, auth } from 'bento';

module.exports = class AdminUsersView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      user: null,
    };
  }
  componentDidMount() {
    api.get(`/users/${this.props.params.id}`, (err, user) => {
      if (!auth.user().canSee('user', user)) {
        return this.props.history.replaceState({}, '/forbidden');
      }
      this.setState({user, loaded: true});
    });
  }
  render() {
    let {loaded} = this.state
    return !loaded ? (
      <div id="booking-view">
        <div className="booking-message">
          Loading ...
        </div>
      </div>
    ) :(
      <div id="users">
        <UserDetails id={ this.props.params.id } user={this.state.user} />
        {/*<UserParking admin={true} userId={ this.props.params.id }/>*/}
        <UserLicense id={ this.props.params.id } isAdmin={true} />
        <UsersEvents id={ this.props.params.id } />
        {/*<Stats id={ this.props.params.id }/>*/}
        <Logs userId={ this.props.params.id } />
        <NotesList type='user' identifier={ this.props.params.id }></NotesList>
      </div>
    );
  }
};

