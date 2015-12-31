import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from './app/header';

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
        { this.props.children }
      </div>
    );
  }
}

// ### Register Template

templates.register('site', {
  component   : SiteTemplate,
  childRoutes : [
    {
      path    : '/terms',
      onEnter : {
        window.location = '/terms.pdf'
      }
    },
    {
      path      : '/privacy',
      component : require('views/site/privacy')
    }
    /*
    {
      path      : '/fee-schedule',
      component : require('views/site/fee-schedule')
    },
    {
      path      : '/support',
      component : require('views/site/support')
    }
    */
  ]
});
