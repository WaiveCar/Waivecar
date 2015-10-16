'use strict';

import React         from 'react';
import { Image }     from 'reach-components';
import { resources } from 'reach-ui';

class UIImage extends React.Component {
  render() {
    return (
      <Image
        resource = { resources.get('files') }
        { ...this.props }
      />
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Image',
      type    : 'image',
      class   : UIImage,
      icon    : 'image',
      options : [
        {
          name      : 'type',
          label     : 'File Type',
          component : 'react-select',
          options   : [
            {
              name  : 'Image',
              value : 'image'
            },
            {
              name  : 'Document',
              value : 'document'
            }
          ],
          helpText  : 'Select the File Type to be displayed',
          required  : true
        },
        {
          name      : 'link',
          label     : 'Link',
          component : 'input',
          type      : 'text',
          helpText  : 'If the File should link somewhere, provide a URL'
        },
        {
          name      : 'id',
          label     : 'Image',
          component : 'file',
          required  : true
        }
      ]
    };
  }
}
