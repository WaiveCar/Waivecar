import React                     from 'react';
import moment                    from 'moment'
import { auth, relay, dom, api } from 'bento';
import { Form }                  from 'bento-web';
import config                    from 'config';
import License                   from '../../lib/license-service';

let formFields = {
  license : require('./form-fields/license'),
};

let buttons = [
  {
    value: 'Update License',
    type: 'submit',
    class: 'btn btn-primary btn-profile-submit',
  },
];

module.exports = class ProfileLicenseView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state   = {};
    this.license = new License(this);
  }

  /**
   * Not sure what this does
   * @param  {Object} item
   * @param  {String} value
   * @return {Void}
   */
  handleChange = (item, value) => {
    const newState = {};
    newState[item] = value;
    this.setState(newState);
  }

  /**
   * Fetches licenses registered to the authenticated user.
   * @return {Void}
   */
  componentDidMount() {
    this.license.setLicenses(this.props.userId ? this.props.userId : auth.user().id);
  }

  /**
   * Renders out the license registration form.
   * TODO: Optionaly this can take a license object if we want to go into edit mode?
   * @return {Object}
   */
  renderLicenseRegistration() {
    let license = {
      firstName : this.props.userId ? '' : auth.user().firstName,
      lastName  : this.props.userId ? '' : auth.user().lastName
    };
    return (
      <div className="box">
        <h3>
          Driver's License Registration <small>Register your license to gain access to the waivecar app.</small>
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
            submit = { (formData) => this.license.submitLicense(formData, this.props.userId ? this.props.userId : auth.user().id) }
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the license data that has been registered.
   * TODO! Polished view, should probably have this as presentation view and a seperate
   *       edit view. Currently renders license in a pre box as date picker crashes
   *       the ability to render this view in a form.
   * @param  {Object} license
   * @return {Object}
   */
  renderLicense(license) {
    license.birthDate = moment(license.birthDate).format('YYYY-MM-DD');
    license.expirationDate = moment(license.expirationDate).format('YYYY-MM-DD');
    return (
      <div className="box">
        <h3>
          Your License <small>Your registered license details.</small>
        </h3>
        <div className="box-content">
          <Form
            ref       = "license"
            className = "bento-form-static"
            disabled  = { true }
            fields    = { formFields.license }
            default   = { license }
            buttons={buttons}
            submit={this.license.update}
          />
          {/* this.renderStatus(license.status, license.outcome) */}
        </div>
      </div>
    )
  }

  renderFileUpload(id) {
    return (
      <div className="box">
        <h3>
          Upload License <small>Submit an image of your license for verification.</small>
        </h3>
        <div className="box-content license-upload">
          <input type="file" name={ id } ref="licenseImage" />
          <button type="button" onClick={ this.uploadFile }>Upload</button>
        </div>
      </div>
    );
  }

  uploadFile = () => {
    let licenseImage = this.refs.licenseImage;
    if (licenseImage) {
      api.file(`/files?licenseId=${ licenseImage.name }`, {
        files : licenseImage.files
      }, (err) => {
        if (err) {
          return console.log(err);
        }
        document.location.reload(true); // Super dirty, make this more reacty when we got time
      });
    }
  }

  renderLicenseImage(id) {
    return (
      <div className="box">
        <h3>
          License Image <small>Image of your submitted license.</small>
        </h3>
        <div className="box-content license-image">
          <img src={ `${ config.api.uri }:${ config.api.port }/file/${ id }` } />
        </div>
      </div>
    );
  }

  renderStatus(status, outcome) {
    if (status !== 'provided' || auth.user().isWaivework) {
      return (
        <div className="license-verification text-center">
          { !outcome && !auth.user().isWaivework && <p className="bg-info p-a">Pending Verification</p> }
          { outcome === 'consider' && <p className="bg-danger p-a">At this time your license has failed verification and you are unable to book a car. <br />If you would like a copy of your report or further explanation, please contact us.</p> }
          { outcome === 'clear'    && <p className="bg-success p-a">Your License has been cleared.</p> }
          { auth.user().isWaivework && <p className="bg-success p-a">Thanks for signing up for WaiveWork</p>}
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

  /**
   * Renders license view.
   * @return {Object}
   */
  render() {
    if (this.state.isLoading) {
      return <div>Loading...</div>
    }

    // ### License

    let licenses = this.license.getState('licenses');
    let license  = null;
    if (licenses.length) {
      license = licenses[0];
      //
      // There's a bug in the bento libraries with respect
      // to timestamps.  Likely the easiest way to address it is to 
      // fix it here. The bug tries to localize a UTC time stamp, 
      // sending birthdays back 1 day.  See #473 and #645 for details.
      //
      // The "easiest" fix is to un-UTC the timestamp by taking off 
      // the "Z" at the end.
      //
      license.birthDate = license.birthDate.replace(/Z$/, '');
    }

    return (
      <div className="profile">
        { license && !license.fileId ? this.renderFileUpload(license.id) : '' }
        { license ? this.renderLicense(license) : this.renderLicenseRegistration() }
        { license && license.fileId ? this.renderLicenseImage(license.fileId) : '' }
      </div>
    );
  }

}
