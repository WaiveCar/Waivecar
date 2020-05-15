import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import moment from 'moment';

class Insurance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      insurance: [],
      expireDate: null,
      uploading: false,
      loaded: false,
    };
    this.fileUpload = null;
    this._user = this.props._user;
  }

  componentDidMount() {
    let {organizationId} = this.props;
    api.get(
      `/files?organizationId=${organizationId}&collectionId=insurance`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({insurance: response, loaded: true});
      },
    );
  }

  upload() {
    let {expireDate} = this.state;
    let {organizationId} = this.props;
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
          `/files?organizationId=${organizationId}&collectionId=insurance`,
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
  deleteInsurance(id, idx) {
    if (confirm('Are you sure you want to delete this insurance policy?')) {
      api.delete(`/files/${id}`, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: `Uploading file: ${err.message}`,
          });
        }
        this.setState(state => ({
          insurance: state.insurance.filter(el => el.id !== id),
        }));
      });
    }
  }

  render() {
    let {uploading, insurance, loaded} = this.state;
    return (
      <div>
        {this._user.hasAccess('waiveAdmin') && (
          <div>
            <input
              type="date"
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
          </div>)
        }
        {loaded &&
          <div style={{width: '100%'}}>
            <table className="box-table table-striped">
              <thead>
                <tr>
                  <th>Expiration Date</th>
                  <th>Added On:</th>
                  {this._user.hasAccess('waiveAdmin') && (
                    <th className="text-center">Delete</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {insurance.length ? insurance.map((each, i) => (
                  <tr key={i}>
                    <td>
                      <a
                        href={`http://waivecar-prod.s3.amazonaws.com/${each.path}`}
                        target="_blank">
                        {moment(each.comment).format('MM/DD/YYYY')}
                      </a>{' '}
                    </td>
                    <td>{moment(each.createdAt).format('MM/DD/YYYY')}</td>
                    {this._user.hasAccess('waiveAdmin') && (
                      <td className="text-center">
                        <button
                          className="test"
                          onClick={() => this.deleteInsurance(each.id, i)}>
                          <i className="material-icons">delete</i>
                        </button>
                      </td>
                    )}
                  </tr>
                )): <tr><td colSpan="3" className="text-center">No policies uploaded.</td></tr>}
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }
}

export default Insurance;
