'use strict';

import React         from 'react';
import { Image }     from 'bento-web';
import resources      from '../lib/resources';

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
module.exports = {
  build : function() {
    return {
      name    : 'Image',
      type    : 'image',
      order   : 5,
      class   : UIImage,
      icon    : 'image',
      options : [
        {
          name      : 'type',
          label     : 'File Type',
          component : 'select',
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
          default   : 'image',
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
