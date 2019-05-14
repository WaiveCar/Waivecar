import React, {Component} from 'react';
import {api} from 'bento';

class Documentation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      registration: null,
      inspection: null,
    };
  }

  upload(type) {
    let {registrationExpireDate, inspectionExpireDate} = this.state;
    let expireDate =
      type === 'registration' ? registrationExpireDate : inspectionExpireDate;
    let fileRef =
      type === 'registration'
        ? this.registrationFileUpload
        : this.inspectionFileUpload;
    if (!expireDate || !fileRef.files.length) {
      return snackbar.notify({
        type: 'danger',
        message:
          'Please add a policy number and choose a file before uploading a file.',
      });
    }
    this.setState(
      state => ({uploading: true}),
      () => {
        let files = Array.from(fileRef.files);
        let formData = new FormData();
        files.forEach((file, i) => {
          formData.append(i, file);
        });
        formData.append('comment', expireDate);
        api.post(`/files?collectionId=${type}`, formData, (err, response) => {
          if (err) {
            this.setState({uploading: false});
            return snackbar.notify({
              type: 'danger',
              message: `Uploading file: ${err.message}`,
            });
          }
          fileRef.value = '';
          //store new file in state below
          console.log('response', response);
          this.setState({
            uploading: false,
            [type]: response[0],
          });
        });
      },
    );
  }

  render() {
    let {uploading} = this.state;
    return (
      <div className="box">
        <h3>Car Documentation</h3>
        <div className="box-content">
          {['registration', 'inspection'].map((type, i) => (
            <div key={i} className="row" style={{marginTop: '2em'}}>
              <h4>Upload {type}</h4>
              <div className="row">
                <input
                  type="date"
                  className="col-xs-6"
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  placeholder="Expiration Date"
                  onChange={e =>
                    this.setState({[`${type}ExpireDate`]: e.target.value})
                  }
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  disabled={uploading}>
                  <label
                    htmlFor={`new${type}File`}
                    style={{
                      width: '100%',
                      height: '100%',
                      marginBottom: 0,
                    }}>
                    Upload
                  </label>
                  <input
                    style={{
                      opacity: 0,
                      overflow: 'hidden',
                      position: 'absolute',
                      zIndex: -1,
                    }}
                    type="file"
                    id={`new${type}File`}
                    accept="application/pdf, image/jpeg"
                    ref={ref => (this[`${type}FileUpload`] = ref)}
                    onInput={() => this.upload(type)}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Documentation;
