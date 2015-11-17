'use strict';

import React                 from 'react';
import { auth, relay, api }  from 'bento';
import { Form, snackbar }    from 'bento-web';
import { resources, fields } from 'bento-ui';
import md5                   from 'md5';
import Account               from '../lib/account-service';

// ### Form Fields

let formFields = {
  personal : require('./form-fields/personal')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state   = {};
    this.account = new Account(this);
    relay.subscribe(this, 'me');
  }

  /**
   * Load the current account status.
   */
  componentDidMount() {
    this.account.status();
  }

  /**
   * Render the personal details form.
   * @return {Object}
   */
  renderPersonalDetails() {
    return (
      <div className="profile-box">
        <h3>
          Personal Details
          <small>
            Review, and edit your personal details.
          </small>
        </h3>
        <div className="profile-box-content">
          <Form
            ref       = "personal"
            className = "bento-form-static"
            fields    = { formFields.personal }
            default   = { this.state.me }
            buttons   = {[
              {
                value : 'Update Details',
                type  : 'submit',
                class : 'btn btn-primary btn-profile-submit'
              }
            ]}
            submit = { this.account.submitUser }
          />
        </div>
      </div>
    );
  }

  /**
   * Renders account status, shows a list of required parameters
   * and its current status.
   * @return {Object}
   */
  renderAccountStatus() {
    return (
      <div className="profile-box">
        <h3>
          Account Status
          <small>
            Your current account status.
          </small>
        </h3>
        <div className="profile-box-content">
          <table className="table-striped profile-table">
            <thead>
              <tr>
                <th>Type</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
            {
              this.state.account.status.map((status, i) => {
                return (
                  <tr key={ i }>
                    <td>{ status.type }</td>
                    <td className="profile-status-check">
                      { status.isValid ? <i className="material-icons">done</i> : '' }
                    </td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
          <p className="profile-box-info">
            WaiveCar requires the leading details to be verified before your account can place a new booking.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Rdner the profile view.
   * @return {Object}
   */
  render() {
    let user = this.state.me;
    return (
      <div className="profile">
        <div className="profile-header">
          <div className="profile-image">
            <div style={{ background : user.email ? `url(//www.gravatar.com/avatar/${ md5(user.email) }?s=150) center center / cover` : '#fff' }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { user.firstName } { user.lastName }
            </div>
          </div>
        </div>

        { this.renderPersonalDetails() }
        { this.renderAccountStatus() }
      </div>
    );
  }

}
