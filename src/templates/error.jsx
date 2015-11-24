'use strict';

import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from './app/header';

/**
 * @class AppTemplate
 */
class ErrorTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'site');
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'site');
  }

  /**
   * @method render
   */
  render() {
    return (
      <div id="site">
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

templates.register('error', {
  component   : ErrorTemplate,
  childRoutes : [
    {
      path      : '*',
      component : require('views/error/404'),
      onEnter   : policies.isAnonymous
    }
  ]
});
