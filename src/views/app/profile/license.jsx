'use strict';

import React                from 'react';
import { auth, relay, dom } from 'bento';
import { Form }             from 'bento-web';
import License              from '../lib/license-service';
import DatePicker from 'react-toolbox/lib/date_picker';

const datetime = new Date(2015, 10, 16);
const min_datetime = new Date(new Date(datetime).setDate(8));
datetime.setHours(17);
datetime.setMinutes(28);

let formFields = {
  license : require('./form-fields/license'),
};

module.exports = class ProfileLicenseView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('License');
    this.state = {
      date2 : datetime
    };
    this.license = new License(this);
  }

  handleChange = (item, value) => {
    console.log(item);
    const newState = {};
    newState[item] = value;
    this.setState(newState);
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
      <div className="box">
        <h3>
          License Registration <small>Register your license to gain access to the waivecar app.</small>
        </h3>
        <div className="box-content">
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
          <section>
            <DatePicker
              label='Expiration date'
              minDate={min_datetime}
              onChange={ this.handleChange.bind(this) }
              onClick={ this.handleChange.bind(this, 'date2') }
              value={ this.state.date2 }
            />
          </section>
        </div>
      </div>
    );
  }

  renderLicense(license) {
    return (
      <div className="box">
        <h3>
          License
        </h3>
        <div className="box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            fields    = { formFields.license }
            default   = { license }
          />
          { this.renderStatus(license.status, license.outcome) }
        </div>
      </div>
    )
  }

    /**
   * Render Verification CTA
   * @return {Object}
   */
  renderStatus(status, outcome) {
    if (status !== 'provided') {
      return (
        <div className="license-verification text-center">
          { !outcome               && <p className="bg-info p-a">Pending Verification</p> }
          { outcome === 'consider' && <p className="bg-danger p-a">At this time your license has failed verification and you are unable to book a car. <br />If you would like a copy of your report or further explanation, please contact us.</p> }
          { outcome === 'clear'    && <p className="bg-success p-a">Your License has been cleared.</p> }
        </div>
      );
    }

    return (
      <div className="license-verification text-center">
        <p className="box-info text-center">
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
