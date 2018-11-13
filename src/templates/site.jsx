import React                    from 'react';
import Reach, { relay }         from 'bento';
import UI, { templates, views } from 'bento-ui';
import policies                 from 'policies';
import Header                   from './app/header';

class SiteTemplate extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'site');
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'site');
  }

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
      onEnter : function () {
        window.location = '/terms.pdf'
      }
    },
    {
      path      : '/privacy',
      component : require('views/site/privacy')
    },
    {
      path      : '/faq',
      component : require('views/site/faq')
    },
    {
      path      : '/waitlist',
      component : require('views/site/waitlist')
    },
    {
      path      : '/faq-csula',
      component : require('views/site/csula')
    },
    {
      path      : '/faq-level',
      component : require('views/site/faqlevel')
    },
    {
      path      : '/jobs',
      component : require('views/site/job')
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
