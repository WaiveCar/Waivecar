'use strict';

import React                             from 'react';
import { Content }                       from 'reach-components';
import { components, fields, resources } from 'reach-ui';

class UIContent extends React.Component {
  render() {
    return (
      <Content
        resource = { resources.get('contents') }
        { ...this.props }
      />
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Content',
      type    : 'content',
      class   : UIContent,
      icon    : 'editor',
      options : [
        {
          name      : 'id',
          label     : 'Content Id',
          component : 'input',
          type      : 'number',
          helpText  : 'Enter a known Id'
        }
      ]
    };
  }
}