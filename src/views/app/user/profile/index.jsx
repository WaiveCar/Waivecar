import React                     from 'react';
import { auth, relay, api, dom } from 'bento';
import { Files }                 from 'bento-service';
import { Form, snackbar }        from 'bento-web';
import { resources, fields }     from 'bento-ui';
import Account                   from '../../lib/account-service';
import CardList                  from '../../components/user/cards/card-list';
import RideList                  from '../../components/user/rides/ride-list';
import ChargeList                from '../../components/user/charges/charge-list';
import UserParking               from '../../components/user/user-parking/user-parking';
import facebook                  from '../../../auth/facebook';

// ### Form Fields

let formFields = {
  personal : require('./form-fields/personal')
};

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);

    dom.setTitle('Profile');

    // ### State & Service

    this.state   = {};
    this.account = new Account(this);
    this.avatar  = new Files(this, 'avatar');

    // ### Function Binds

    this.submitToken = this.submitToken.bind(this);

    // ### Relay Subscriptions

    relay.subscribe(this, 'users');
  }

  /**
   * Load the current account status.
   */
  componentDidMount() {
    this.account.status();
  }

  /**
   * Unsub from relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'users');
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

      this.account.status();
    });
  }

  /**
   * Sends a new verification sms
   */
  submitVerification() {
    let user = auth.user();
    api.post(`/verifications/phone-verification/${ user.id }`, {}, (err, res) => {
      if (err) {
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
    let user = auth.user();

    let buttons = [{
      value : 'Update Details',
      type  : 'submit',
      class : 'btn btn-primary btn-profile-submit'
    }];

    if (user.phone && !user.verifiedPhone) {
      buttons.push({
        value : 'Send Verification SMS',
        class : 'btn btn-primary',
        click : this.submitVerification
      });
    }

    return (
      <div className="box">
        <h3>
          Personal Details
          <small>
            Review, and edit your personal details.
          </small>
        </h3>
        <div className="box-content">
          <Form
            ref       = "personal"
            className = "bento-form-static"
            fields    = { formFields.personal }
            default   = { user }
            buttons   = { buttons }
            submit = { this.account.submitUser }
          />
        </div>
      </div>
    );
  }

  renderCards() {
    let user = auth.user();
    return (
      <CardList user={ user }></CardList>
    );
  }

  renderCharges() {
    let user = auth.user();
    return (
      <div className='rides'>
        <ChargeList user={ user } full={ false }></ChargeList>
      </div>
    );
  }

  renderRides() {
    let user = auth.user();
    return (
      <div className='rides'>
        <RideList user={ user } full={ false }></RideList>
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
      <div className="box">
        <h3>
          Account Status
          <small>
            Your current account status.
          </small>
        </h3>
        <div className="box-content">
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
          <p className="box-info text-center">
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

  render() {
    let user = auth.user();
    return (
      <div className="profile">
        <div className="profile-header">
          <div className="profile-image">
            <input type="file" style={{ display : 'none' }} ref="avatar" onChange={ this.avatar.bindUpload(`/files?isAvatar=true&userId=${ user.id }`, user.avatar) } />
            <div className="profile-image-selector" onClick={ this.avatar.select }>
              <i className="material-icons" role="avatar-upload">add_a_photo</i>
            </div>
            <div className="profile-image-view" style={{ background : `url(${ user.getAvatar() }) center center / cover` }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { user.getName() } <span>{user.isWaivework ? 'Waivework' : ''}</span>
            </div>
          </div>
        </div>
        <UserParking admin={false} userId={ user.id }/>
        { this.renderFacebookConnect() }
        { this.renderPersonalDetails() }
        { this.renderCards() }
        { this.renderRides() }
        { this.renderCharges() }
        { this.renderAccountStatus() }
      </div>
    );
  }

}
