'use strict';

import React           from 'react';
import { auth, relay } from 'bento';
import { Form }        from 'bento-web';
import Account         from '../lib/account-service';

// ### Form Fields

let formFields = {
  password : require('./form-fields/password')
};

module.exports = class ProfilePasswordView extends React.Component {

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
        <div className="profile-box">
          <h3>
            Change Password <small>Update your account password.</small>
          </h3>
          <div className="profile-box-content">
            <Form
              ref       = "personal"
              className = "bento-form-static"
              fields    = { formFields.password }
              default   = { auth.user }
              buttons   = {[
                {
                  value : 'Update Password',
                  type  : 'submit',
                  class : 'btn btn-primary btn-profile-submit'
                }
              ]}
              submit = { this.account.submitPassword }
            />
          </div>
        </div>
      </div>
    );
  }

}