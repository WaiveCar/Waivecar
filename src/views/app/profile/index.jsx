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

    relay.subscribe(this, 'app');
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {
    this.payment.ensureCustomer(auth.user);
    this.payment.setCards();
    this.app.update({
      display : false
    });
  }

  /**
   * Unsubscribes from the app reducer.
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'app');
  }

  /**
   * @return {Object}
   */
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
              className = "bento-form-static"
              fields    = { formFields.personal }
              default   = { auth.user }
              buttons   = {[
                {
                  value : 'Update Details',
                  type  : 'submit',
                  class : 'btn btn-primary btn-profile-submit'
                }
              ]}
              submit = { () => {} }
            />
          </div>
        </div>
      </div>
    );
  }

}