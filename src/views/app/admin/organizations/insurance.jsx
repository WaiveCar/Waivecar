import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-ui';

class Insurance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      insurance: [],
      expireDate: null,
      uploading: false,
    };
    this.fileUpload = null;
  }

  upload() {
    let {expireDate} = this.state;
    if (!expireDate || !this.fileUpload.files.length) {
      return snackbar.notify({
        type: 'danger',
        message:
          'Please add a expiration date and choose a file before uploading a file.',
      });
    }
    this.setState(
      state => ({uploading: true}),
      () => {
        let files = Array.from(this.fileUpload.files);
        let formData = new FormData();
        files.forEach((file, i) => {
          formData.append(i, file);
        });
        formData.append('comment', expireDate);
        api.post(
          `/files?organizationId=${this.props.user.id}&collectionId=insurance`,
          formData,
          (err, response) => {
            if (err) {
              this.setState({uploading: false});
              return snackbar.notify({
                type: 'danger',
                message: `Error uploading file: ${err.message}`,
              });
            }
            this.fileUpload.value = '';
            this.setState(state => ({
              insurance: [...response, ...state.insurance],
              uploading: false,
            }));
          },
        );
      },
    );
  }

  render() {
    let {uploading} = this.state;
    return (
      <div>
        <input
          type="text"
          className="col-xs-6"
          style={{marginTop: '1px', padding: '2px', height: '40px'}}
          placeholder="Expiration Date (MM/DD/YYYY)"
          onChange={e => this.setState({expireDate: e.target.value})}
        />
        <button
          className="btn btn-primary btn-sm col-xs-6"
          disabled={uploading}>
          <label
            htmlFor="newFile"
            style={{
              width: '100%',
              height: '100%',
              marginBottom: 0,
              cursor: 'pointer',
            }}>
            Upload
          </label>
          <input
            style={{
              opacity: 0,
              overflow: 'hidden',
              position: 'absolute',
              top: '50%',
              right: '50%',
              zIndex: -1,
            }}
            type="file"
            id="newFile"
            accept="application/pdf, image/jpeg"
            ref={ref => (this.fileUpload = ref)}
            onInput={() => this.upload()}
          />
        </button>
      </div>
    );
  }
}

export default Insurance;
