'use strict';

import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from './app/header';

/**
 * @class AppTemplate
 */
class HomeTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'home');
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'home');
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="home">
        <Header />
        <div id="content">
          <div id="content-wrapper">
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

// ### Register Template
templates.register('home', {
  component : HomeTemplate,
  getChildRoutes(state, done) {
    done(null, views.getRoutes('home'));
  }
});
