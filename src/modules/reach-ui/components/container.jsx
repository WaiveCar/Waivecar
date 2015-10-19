'use strict';

import React      from 'react';
import { Layout } from 'reach-components';

let { Container } = Layout;

class UIContainer extends React.Component {
  render() {
    return (
      <Container
        { ...this.props }
      />
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Container',
      type    : 'container',
      class   : UIContainer,
      icon    : 'border_outer',
      options : [
        {
          name      : 'type',
          label     : 'Container Type',
          component : 'select',
          options   : [
            {
              name  : 'Section',
              value : 'section'
            },
            {
              name  : 'Header',
              value : 'header'
            },
            {
              name  : 'Footer',
              value : 'footer'
            }
          ],
          default   : 'section',
          helpText  : 'Select Container Type',
          required  : false
        },
        {
          name      : 'height',
          label     : 'height',
          component : 'input',
          type      : 'string',
          helpText  : 'Enter Height in Pixels',
          required  : false
        },
        {
          name      : 'fileId',
          label     : 'Background Image',
          component : 'file',
          required  : false
        }
      ]
    };
  }
}