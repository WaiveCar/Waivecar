import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import moment from 'moment';

class Documentation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      car: props.car,
      inspectionFile: null,
      registrationFile: null,
    };
  }

  componentDidMount() {
    let {car} = this.props;

    for (let type of ['inspection', 'registration']) {
      api.get(`/files/${car[`${type}FileId`]}`, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({[`${type}File`]: response});
      });
    }
  }

  upload(type) {
    let {registrationExpireDate, inspectionExpireDate} = this.state;
    let {submit} = this.props;
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
          'Please add an expiration date and choose a file before uploading a file.',
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
          this.updateCar({[`${type}FileId`]: response[0].id}, car =>
            this.setState({
              uploading: false,
              [`${type}File`]: response[0],
              car,
            }),
          );
        });
      },
    );
  }

  updateCar = (body, cb) => {
    api.put(`/cars/${this.props.car.id}`, body, (err, response) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      if (cb) {
        cb(response);
      }
    });
  };

  render() {
    let {uploading, car} = this.state;
    console.log(this.state);
    return (
      <div className="box">
        <h3>Car Documentation</h3>
        <div
          className="box-content"
          style={{display: 'flex', justifyContent: 'center'}}>
          <div style={{width: '80%'}}>
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
                <div>
                  {this.state[`${type}File`] ? (
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                      <a
                        href={`http://waivecar-prod.s3.amazonaws.com/${
                          this.state[`${type}File`].path
                        }`}
                        target="_blank">
                        <div>
                          Expiring on{' '}
                          {moment(this.state[`${type}File`].comment).format(
                            'MM/DD/YYYY',
                          )}
                        </div>
                        <div>
                          {this.state[`${type}File`].mime ===
                          'application/pdf' ? (
                            <embed
                              style={{height: '400px'}}
                              src={`http://docs.google.com/gview?url=http://waivecar-prod.s3.amazonaws.com/${
                                this.state[`${type}File`].path
                              }&embedded=true`}
                            />
                          ) : (
                            <img
                              src={`http://waivecar-prod.s3.amazonaws.com/${
                                this.state[`${type}File`].path
                              }`}
                            />
                          )}
                        </div>
                      </a>
                    </div>
                  ) : (
                    `${type} not yet uploaded`
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Documentation;
