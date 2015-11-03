'use strict';

import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Sidebar                  from './sidebar';
import Header                   from './header';

/**
 * @class AppTemplate
 */
class AppTemplate extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'app');
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  /**
   * @method render
   */
  render() {
    let { title, description } = this.state.app;
    return (
      <div id="app">
        <Header />
        <Sidebar />
        <div id="content">
          <div className="content-wrapper">
            <h1>
              { title }
              <small>
                { description }
              </small>
            </h1>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }

}

// ### Register Template

templates.register('app', {
  component : AppTemplate,
  onEnter   : policies.isAuthenticated,
  getChildRoutes(state, done) {
    done(null, views.getRoutes('app'));
  }
});
