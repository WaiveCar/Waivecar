import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

let types = ['left', 'right', 'front', 'rear', 'other'];

class UploadDamage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choosingDamage: false,
      uploading: false,
    };
    types.forEach(type => {
      this[type] = null;
      this.state[`${type}File`] = null;
    });
  }

  upload(type) {
    let fileRef = this[type];
    this.setState(
      state => ({uploading: true}),
      () => {
        let files = Array.from(fileRef.files);
        let formData = new FormData();
        files.forEach((file, i) => {
          formData.append(i, file);
        });
        api.post('/files', formData, (err, response) => {
          if (err) {
            this.setState({uploading: false});
            return snackbar.notify({
              type: 'danger',
              message: `Error uploading file: ${err.message}`,
            });
          }
          fileRef.value = '';
          this.setState(
            {
              uploading: false,
              [`${type}File`]: response[0],
            },
            () => {
              let temp = this.state[`${type}File`];
              temp.type = type;
              this.setState({
                [`${type}File`]: temp,
              });
            },
          );
        });
      },
    );
  }

  submitReport() {
    let {booking} = this.props;
    let files = [];
    types.forEach(type => {
      if (this.state[`${type}File`]) {
        files.push(this.state[`${type}File`]);
      }
    });
    api.post('/reports', {bookingId: booking.id, files}, (err, result) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error creating report: ${err.message}`,
        });
      }
      let stateUpdate = {};
      types.forEach(type => {
        stateUpdate[`${type}File`] = null;
      });
      if (window.location.href.includes('bookings')) {
        window.location.reload();
      }
      this.props.markDamageUploaded();
      this.setState(stateUpdate, () =>
        snackbar.notify({
          type: 'success',
          message: 'Report successfully submitted for this booking.',
        }),
      );
    });
  }

  render() {
    let {choosingDamage} = this.state;
    return (
      <div style={{marginTop: '1rem'}}>
        <div
          className="row"
          style={{display: 'flex', justifyContent: 'center'}}>
          <button
            className="btn btn-primary btn-sm col-xs-6"
            onClick={() =>
              this.setState(state => ({choosingDamage: !state.choosingDamage}))
            }>
            {choosingDamage ? 'Hide Photo Selector' : 'Show Photo Selector'}
          </button>
        </div>
        {choosingDamage && (
          <div className="row" style={{marginTop: '1rem'}}>
            <h4>Damage Image Uploads</h4>
            <div className="row" style={{margin: '0.5rem 0'}}>
              <div
                className="row"
                style={
                  window.outerWidth > 720
                    ? {
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }
                    : {}
                }>
                {types.map((type, i) => (
                  <div
                    key={i}
                    style={window.outerWidth > 720 ? {maxWidth: '20%'} : {}}>
                    <button className="btn btn-sm col-xs-12">
                      <label
                        htmlFor={`${type}File`}
                        style={{
                          width: '100%',
                          height: '100%',
                          marginBottom: 0,
                          cursor: 'pointer',
                        }}>
                        {type}
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
                        id={`${type}File`}
                        accept="image/jpeg"
                        ref={ref => (this[type] = ref)}
                        onInput={() => this.upload(type)}
                      />
                    </button>
                    {this.state[`${type}File`] ? (
                      <div>
                        <a
                          href={`http://waivecar-prod.s3.amazonaws.com/${
                            this.state[`${type}File`].path
                          }`}
                          target="_blank">
                          <img
                            style={{width: '100%'}}
                            src={`http://waivecar-prod.s3.amazonaws.com/${
                              this.state[`${type}File`].path
                            }`}
                          />
                        </a>
                      </div>
                    ) : (
                      <div>no file selected</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm col-xs-12"
              onClick={() => this.submitReport()}>
              Submit Report
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default UploadDamage;
