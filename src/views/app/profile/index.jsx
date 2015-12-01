'use strict';

import React                     from 'react';
import { auth, relay, api, dom } from 'bento';
import { Form, snackbar }        from 'bento-web';
import { resources, fields }     from 'bento-ui';
import Account                   from '../lib/account-service';
import facebook                  from '../../auth/facebook';

// ### Form Fields

let formFields = {
  personal : require('./form-fields/personal')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);

    dom.setTitle('Profile');

    // ### State & Service

    this.state        = {};
    this.account      = new Account(this);

    // ### Function Binds

    this.submitToken  = this.submitToken.bind(this);
    this.selectAvatar = this.selectAvatar.bind(this);
    this.uploadAvatar = this.uploadAvatar.bind(this);
    this.deleteAvatar = this.deleteAvatar.bind(this);

    // ### Relay Subscriptions

    relay.subscribe(this, 'me');
  }

  /**
   * Load the current account status.
   */
  componentDidMount() {
    this.account.status();
  }

  /**
   * Opens file selection box.
   * @return {Void} [description]
   */
  selectAvatar() {
    this.refs.avatar.click();
  }

  /**
   * Attempts to upload a new avatar.
   * @return {Void} [description]
   */
  uploadAvatar() {
    let user = auth.user();
    let prev = user.avatar;
    api.file(`/files?isAvatar=true&userId=${ user.id }`, {
      files : this.refs.avatar.files
    }, (err, res) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      if (prev) {
        this.deleteAvatar(prev); // Delete previous avatar, reduces bloat...
      }
    });
  }

  /**
   * Attempts to delete an avatar.
   * @param  {String} id
   * @return {Void} [description]
   */
  deleteAvatar(id) {
    api.delete(`/files/${ id }`, (err) => {
      if (err) {
        snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
    });
  }

  /**
   * Render facebook connect button if no facebook ID exists on the user.
   * @return {Object}
   */
  renderFacebookConnect() {
    let user = auth.user();
    if (!user.facebook) {
      return (
        <button className="r-btn btn-facebook" onClick={ this.facebookConnect }>
          <i className="fa fa-facebook" />
          Connect with Facebook
        </button>
      );
    }
  }

  /**
   * Performs a facebook connect request.
   * @return {Void} [description]
   */
  facebookConnect() {
    facebook.connect((error) => {
      if (error) {
        return snackbar.notify({
          type    : `danger`,
          message : error.message
        });
      }
      snackbar.notify({
        type    : `success`,
        message : 'Your facebook account was successfully connected.'
      });
      relay.dispatch('me', {
        type : 'update',
        data : {
          facebook : true
        }
      });
    });
  }

  /**
   * Sends a verification token the API.
   * @return {Void}
   */
  submitToken() {
    let token = this.refs.verification.value;
    api.put(`/verifications/${ token }`, {}, (error, res) => {
      if (error) {
        return snackbar.notify({
          type    : `danger`,
          message : error.message
        });
      }
      snackbar.notify({
        type    : `success`,
        message : `Verification request was successfull.`
      });
    });
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
                      { status.isValid ? <i className="material-icons text-success">{ status.validIcon }</i> : status.invalidIcon ?  <i className="material-icons text-danger">{ status.invalidIcon }</i> : ''}
                    </td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
          <p className="profile-box-info text-center">
            To verify email or phone, enter the token received by email/sms.
          </p>
          <div className="verification text-center">
            <input type="text" ref="verification" />
            <button type="button" onClick={ this.submitToken }>Submit Token</button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Rdner the profile view.
   * @return {Object}
   */
  render() {
    let user = auth.user();
    return (
      <div className="profile">
        <div className="profile-header">
          <div className="profile-image">
            <input type="file" style={{ display : 'none' }} ref="avatar" onChange={ this.uploadAvatar } />
            <div className="profile-image-selector" onClick={ this.selectAvatar }>
              <i className="material-icons" role="avatar-upload">add_a_photo</i>
            </div>
            <div className="profile-image-view" style={{ background : `url(${ user.getAvatar() }) center center / cover` }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { user.firstName } { user.lastName }
            </div>
          </div>
        </div>

        { this.renderFacebookConnect() }
        { this.renderPersonalDetails() }
        { this.renderAccountStatus() }
      </div>
    );
  }

}
