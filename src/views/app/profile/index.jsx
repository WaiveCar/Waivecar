'use strict';

import React                 from 'react';
import { auth, relay }       from 'bento';
import { Form }              from 'bento-web';
import { resources, fields } from 'bento-ui';
import md5                   from 'md5';

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'app');
  }

  componentDidMount() {
    this.app.update({
      display : false
    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  personalFields() {
    return require('./fields-personal');
  }

  paymentCardFields() {
    return require('./fields-payment-card');
  }

  render() {
    return (
      <div className="profile">

        <div className="profile-header">
          <div className="profile-image">
            <div style={{ background : auth.user.email ? `url(//www.gravatar.com/avatar/${ md5(auth.user.email) }?s=150) center center / cover` : '#fff' }} />
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              { auth.user.firstName } { auth.user.lastName }
            </div>
          </div>
        </div>

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
              className = "bento-form"
              fields    = { this.personalFields() }
              default   = { auth.user }
            />
          </div>
        </div>

        <div className="profile-box">
          <h3>
            Payment Details
            <small>
              Review, and edit your payment details.
            </small>
          </h3>
          <div className="profile-box-content">
            <h4>Add Card</h4>
            <Form
              ref       = "personal"
              className = "bento-form"
              fields    = { this.paymentCardFields() }
              default   = { {} }
            />
          </div>
        </div>

      </div>
    );
  }

}