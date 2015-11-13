'use strict';

import React              from 'react';
import { auth, api }      from 'bento';
import { Form, snackbar } from 'bento-web';
import { fields }         from 'bento-ui';

module.exports = class ProfilePasswordView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      isLoading : true,
      license   : null
    };
    this.submit = this.submit.bind(this);
  }

  componentDidMount() {
    api.get('/licenses', function (err, list) {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.setState({
        isLoading : false,
        license   : list.length ? list[0] : null,
      });
    }.bind(this));
  }

  submit(data) {
    console.log(data);
  }

  renderLicenseRegistration() {
    return (
      <div className="profile-box">
        <h3>
          License Registration <small>Register your license to gain access to the waivecar app.</small>
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { fields.getArray('licenses', [ 'number', 'firstName', 'middleName', 'lastName', 'birthDate', 'country', 'state' ]) }
            buttons   = {[
              {
                value : 'Register License',
                type  : 'submit',
                class : 'btn btn-primary btn-profile-submit'
              }
            ]}
            submit = { this.submit }
          />
        </div>
      </div>
    );
  }

  renderLicense() {
    return (
      <div>License</div>
    )
  }

  render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>
    }
    return (
      <div className="profile">
        {
          this.state.license
            ? this.renderLicense() 
            : this.renderLicenseRegistration()
        }
      </div>
    );
  }

}