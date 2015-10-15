'use strict';

import React        from 'react';
import { api }      from 'reach-react';
import { Dropzone } from 'reach-components';
import config       from 'config';

export default class SandboxUpload extends React.Component {
  render() {
    return (
      <div className="container">
        <h3 style={{ margin : '30px 0' }}>DropZone</h3>
        <Dropzone
          options = {{
            url         : `${ config.api.uri }:${ config.api.port }/files`,
            maxFilesize : 2
          }}
        />
        <Dropzone
          options = {{
            url         : `${ config.api.uri }:${ config.api.port }/files`,
            maxFilesize : 2
          }}
        />
      </div>
    );
  }
}