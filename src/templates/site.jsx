'use strict';

import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from 'views/app/header';
import 'styles/site/style.scss';

/**
 * @class AppTemplate
 */
class SiteTemplate extends React.Component {

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

// ### Register Template
templates.register('site', {
  component : SiteTemplate,
  getChildRoutes(state, done) {
    done(null, views.getRoutes('site'));
  }
});