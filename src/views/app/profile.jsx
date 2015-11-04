'use strict';

import React     from 'react';
import { relay } from 'bento';

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'app');
  }

  componentDidMount() {
    this.app.update({
      title       : 'Profile',
      description : 'Manage your account profile, security, and review your status.'
    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  render() {
    return <div>Profile</div>
  }

}