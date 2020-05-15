import React       from 'react';
import mixin       from 'react-mixin';
import { History } from 'react-router';
import { auth }    from 'bento';

@mixin.decorate(History)
class LogoutView extends React.Component {
  componentDidMount() {
    auth.logout();
    this.history.pushState(null, '/login');
  }
  render() {
    return <div>Processing...</div>
  }
}

module.exports = LogoutView;
