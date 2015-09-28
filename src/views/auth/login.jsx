import React              from 'react';
import mixin              from 'react-mixin';
import Reach, { auth }    from 'reach-react';
import { Navigation }     from 'react-router';
import config             from 'config';
import { Form, snackbar } from 'reach-components';

@mixin.decorate(Navigation)

export default class LoginView extends React.Component {

  /**
   * @class LoginView
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.fields = [
      {
        component    : 'input',
        type         : 'text',
        name         : 'identifier',
        label        : 'Email Address',
        tabIndex     : "1",
        autoComplete : "off",
        required     : true
      },
      {
        component    : 'input',
        type         : 'password',
        name         : 'password',
        label        : 'Password',
        tabIndex     : "2",
        autoComplete : "off",
        required     : true
      }
    ];
    this.success = this.success.bind(this);
    this.error   = this.error.bind(this);
  }

  /**
   * @method success
   * @param  {Object} user
   */
  success(user) {
    auth.set(user);
    this.transitionTo('/dashboard');
  }

  /**
   * @method error
   * @param  {Object}   error
   * @param  {Function} reset
   */
  error(error, reset) {
    reset();
    snackbar.notify({
      type    : 'danger',
      message : error.message,
      persist : true,
      action  : {
        title : 'DISMISS',
        click : function () {
          this.dismiss();
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
          <span className="title-site">&nbsp;Login</span>
        </div>
        <Form
          className = "r-form r-form-center"
          action    = "/auth/login"
          method    = "POST"
          fields    = { this.fields }
          onSuccess = { this.success }
          onError   = { this.error }
          buttons   = {[
            {
              value : 'login',
              type  : 'submit',
              class : 'btn btn-login'
            }
          ]}
        />
        <div className="footer">
          Forgot your password? <a tabIndex="4" href="/reset-password">Reset</a>
        </div>
      </div>
    );
  }

}