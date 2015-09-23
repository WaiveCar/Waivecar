'use strict';

import React         from 'react';
import { templates } from 'reach-ui';
import config        from 'config';
import 'styles/site.scss';

/**
 * Renders the site.
 * @class SiteTemplate
 */
class SiteTemplate extends React.Component {
  render() {
    return (
      <div id="site">
        { this.props.children }
      </div>
    );
  }
}

// ### Register Template

templates.register('site', {
  component : SiteTemplate,
  childRoutes : [
    {
      path      : '/',
      component : require('views/site/home')
    }
  ]
});