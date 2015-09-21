'use strict';

import React          from 'react';
import { api, relay } from 'reach-react';
import { components } from 'reach-ui';

let actions = relay.getActions();

class Content extends React.Component {

  /**
   *
   */
  constructor(...args) {
    super(...args);
  }

  /**
   *
   */
  componentDidMount() {
    relay.subscribe(this, 'app');
    relay.dispatch('app', actions.APP_UPDATE({
      title : 'I am Content!'
    }));
  }

  /**
   *
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  /**
   *
   */
  render() {
    return (
      <div>
        I am a reach-ui content component, and will be rendering html from the back end.
      </div>
    );
  }

}

// ### Register Component

components.register({
  type  : 'content',
  class : Content
});