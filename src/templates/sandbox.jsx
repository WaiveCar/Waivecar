import React         from 'react';
import { templates } from 'bento-ui';

class SandboxTemplate extends React.Component {
  render() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }
}

// ### Register Template

templates.register('sandbox', {
  component   : SandboxTemplate,
  childRoutes : [
    {
      path      : '/sandbox/form',
      component : require('views/sandbox/form')
    },
    {
      path      : '/sandbox/upload',
      component : require('views/sandbox/upload')
    },
    {
      path      : '/sandbox/relay',
      component : require('views/sandbox/relay')
    }
  ]
});
