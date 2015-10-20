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
      order   : 2,
      class   : UIContent,
      icon    : 'format_align_justify',
      options : [
        {
          name      : 'html',
          label     : 'Content',
          component : 'input',
          type      : 'string',
          helpText  : 'Enter HTML',
          default   : '<p>Awaiting Content</p>',
          required  : true
        }
      ]
    };
  }
}