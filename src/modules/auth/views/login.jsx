import React              from 'react';
import Reach              from 'reach-react';
import config             from 'config';
import { Form, Snackbar } from 'reach-components';
// TODO: Figure out how to handle this.
// Ideally, FormGroup should remain inaccessible and Login should just use { Form }
import FormGroup from 'reach-components/lib/form/form-group';

export default class LoginView extends React.Component {

  /**
   * @class LoginView
   * @constructor
   */
  constructor(...args) {
    super(...args);

    this.fields = [
      {
        type         : 'text',
        name         : 'email',
        label        : 'Email Address',
        tabIndex     : "1",
        autoComplete : "off",
        required     : true
      },
      {
        type         : 'password',
        name         : 'password',
        label        : 'Password',
        tabIndex     : "2",
        autoComplete : "off",
        required     : true
      }
    ];

    this.onSuccess = this.onSuccess.bind(this);
    this.onError   = this.onError.bind(this);
  }

  /**
   * @method onSuccess
   * @param  {Object} user
   */
  onSuccess(user) {
    Reach.Auth.set(user);
    // TODO: needs to go to either /admin or /app
    // depending upon what user is attempting to login to (and what they have access to)
    window.location = '#/admin';
  }

  /**
   * @method onError
   */
  onError(error) {
    Snackbar.notify({
      type    : 'danger',
      message : error.message,
      persist : true,
      action  : {
        title : 'DISMISS',
        click : () => {
          Snackbar.dismiss();
        }
      }
    });
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="login">
        <i className="app-brand"></i>
        <div className="title">
          { config.app.name }
          <span className="title-site">&nbsp;Admin</span>
        </div>
        <Form 
          action    = "/auth/login"
          method    = "POST"
          fields    = { this.fields }
          onSuccess = { this.onSuccess } 
          onError   = { this.onError }
          formClass = {{
            'form'       : true,
            'reach-form' : true
          }}
          submitClass = {{
            'btn-block'   : true,
            'btn-primary' : true
          }}
        />
        <div className="footer">
          Forgot your password? <a tabIndex="4" href="#/reset-password">Reset</a>
        </div>
      </div>
    );
  }

}