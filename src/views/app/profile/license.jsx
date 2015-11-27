'use strict';

import React                from 'react';
import { auth, relay, dom } from 'bento';
import { Form }             from 'bento-web';
import License              from '../lib/license-service';

let formFields = {
  license : require('./form-fields/license'),
};

module.exports = class ProfileLicenseView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('License');
    this.state   = {};
    this.license = new License(this);
  }

  componentDidMount() {
    this.license.setLicenses();
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  renderLicenseRegistration() {
    const user = auth.user();
    let license = {
      firstName : user.firstName,
      lastName  : user.lastName
    };

    return (
      <div className="profile-box">
        <h3>
          License Registration <small>Register your license to gain access to the waivecar app.</small>
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { formFields.license }
            default   = { license }
            buttons   = {[
              {
                value : 'Register License',
                type  : 'submit',
                class : 'btn btn-primary btn-profile-submit'
              }
            ]}
            submit = { this.license.submitLicense }
          />
        </div>
      </div>
    );
  }

  renderLicense(license) {
    return (
      <div className="profile-box">
        <h3>
          License
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { formFields.license }
            default   = { license }
          />
          { this.renderStatus(license.status) }
        </div>
      </div>
    )
  }

    /**
   * Render Verification CTA
   * @return {Object}
   */
  renderStatus(status) {
    if (status !== 'provided') {
      return (
        <div className="license-verification text-center">
          <button className="btn btn-primary" type="button" readOnly disabled>Status : { status }</button>
        </div>
      );
    }

    return (
      <div className="license-verification text-center">
        <p className="profile-box-info text-center">
          Your license must be verified before you can book a WaiveCar
        </p>
        <button type="button" onClick={ this.license.validateLicense }>Request Validation</button>
      </div>
    );
  }


  render() {
    let licenses = this.license.getState('licenses');

    if (this.state.isLoading) {
      return <div>Loading...</div>
    }
    return (
      <div className="profile">
        {
          licenses && licenses.length > 0
            ? this.renderLicense(licenses[0])
            : this.renderLicenseRegistration()
        }
      </div>
    );
  }

}
