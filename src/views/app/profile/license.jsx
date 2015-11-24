'use strict';

import React                from 'react';
import { auth, relay, dom } from 'bento';
import { Form }             from 'bento-web';
import License              from '../lib/license-service';

let formFields = {
  new    : require('./form-fields/license'),
  update : require('./form-fields/license'),
};

formFields.new.splice(2); // TODO Not accurate; we are guessing at fields.

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
    return (
      <div className="profile-box">
        <h3>
          License Registration <small>Register your license to gain access to the waivecar app.</small>
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { formFields.new }
            default   = { {} }
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

  renderLicense() {
    return (
      <div className="profile-box">
        <h3>
          License
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { formFields.update }
            default   = { this.state.license }
          />
        </div>
      </div>
    )
  }

  render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>
    }
    return (
      <div className="profile">
        {
          this.state.licenses && this.state.licenses.length > 0
            ? this.renderLicense()
            : this.renderLicenseRegistration()
        }
      </div>
    );
  }

}
