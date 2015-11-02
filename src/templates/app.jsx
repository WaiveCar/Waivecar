'use strict';

import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Sidebar                  from 'views/app/sidebar';
import Header                   from 'views/app/header';

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
    let { title } = this.state.app;
    return (
      <div id="app">
        <Header />
        <Sidebar />
        <div id="content">
          <div id="content-wrapper">
            <div className="content-header">
              <h1><span>{ title }</span></h1>
            </div>
            { this.props.children }
          </div>
        </div>
        <div id="events">
          <div className="brand" />
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
