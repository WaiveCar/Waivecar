import React   from 'react';
import { api } from 'bento';
import config  from 'config';

module.exports = class SandboxUpload extends React.Component {

  constructor(...args) {
    super(...args);
    this.upload = this.upload.bind(this);
  }

  upload() {
    let input = this.refs.files;
    api.file('/files?isAvatar=true&userId=1', {
      files : input.files
    }, (err, res) => {
      if (err) {
        return console.log(err);
      }
      console.log(res);
    });
  }

  render() {
    return (
      <div className="container">
        <h3 style={{ margin : '30px 0' }}>File Upload</h3>

        <input type="file" ref="files" multiple="true" />

        <button onClick={ this.upload }>Upload</button>
      </div>
    );
  }

}
