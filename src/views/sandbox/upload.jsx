'use strict';

import React        from 'react';
import { api }      from 'bento';
import { Dropzone } from 'bento-web';
import config       from 'config';

module.exports = class SandboxUpload extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      images : []
    }
  }

  componentDidMount() {
    this.images();
  }

  images() {
    api.get('/files', (err, res) => {
      if (err) {
        return console.log(err);
      }
      this.setState({
        images : res
      });
    }.bind(this));
  }

  render() {
    return (
      <div className="container">

        <h3 style={{ margin : '30px 0' }}>Files</h3>
        <div className="clearfix">
        {
          this.state.images.map((file, key) => {
            return (
              <div
                key   = { key }
                style = {{
                  background : `url('${ config.api.uri }:${ config.api.port }/file/${ file.id }') center center / cover`,
                  float      : 'left',
                  height     : 100,
                  width      : 100
                }}
              />
            )
          })
        }
        </div>

        <h3 style={{ margin : '30px 0' }}>DropZone</h3>
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
