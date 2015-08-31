'use strict';

import React          from 'react';
import { Snackbar }   from 'reach-components';
import { API, Relay } from 'reach-react';

let actions = Relay.getActions();

// ### RelayView

export default class RelayView extends React.Component {

  /**
   * Initial setup of the component, good for doing controller binding
   * for methods affected by view and should have access to `this` ctx.
   * @method constructor
   * @param  {Mixed} ...args
   */
  constructor(...args) {
    super(...args);
    Relay.subscribe(this, 'users');
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    API.get('/users', function (err, list) {
      if (err) {
        return;
      }
      Relay.dispatch('users', actions.USERS_INDEX(list));
    }.bind(this));
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    Relay.unsubscribe(this, 'users');
  }

  handleClick() {
    Snackbar.notify('Sample snackbar notification.');
  }

  /**
   * Render the component.
   * @method render
   */
  render() {
    return (
      <div>
        <button onClick={ this.handleClick }>Click Me!</button>
        {
          this.state.users.map(function (user) {
            return <pre key={ user.id }>{ JSON.stringify(user, null, 2) }</pre>
          })
        }
      </div>
    );
  }
}