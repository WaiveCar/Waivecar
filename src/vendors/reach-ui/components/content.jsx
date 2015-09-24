'use strict';

import React                     from 'react';
import { Content }               from 'reach-components';
import { components, resources } from 'reach-ui';

class UIContent extends React.Component {
  render() {
    return (
      <Content
        id       = { this.props.id }
        resource = { resources.get('contents') }
      />
    );
  }
}

// ### Register Component

components.register({
  type    : 'content',
  class   : UIContent,
  icon    : 'editor',
  options : {
    id : null
  }
});