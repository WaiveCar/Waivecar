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
      order   : 1,
      class   : UIContainer,
      icon    : 'border_outer',
      options : [
        {
          name      : 'containerType',
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
        },
        {
          name      : 'contentClassName',
          label     : 'Content Width',
          component : 'radio',
          options   : [
            {
              name  : 'Expand Components to fill the Container?',
              value : 'container-fluid'
            },
            {
              name  : 'Standard Width for Components',
              value : 'container'
            }
          ],
          helpText  : 'Should the Content expand to fill the container?',
          required  : true,
          default   : 'container'
        }
      ]
    };
  }
}