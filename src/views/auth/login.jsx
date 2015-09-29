import React              from 'react';
import mixin              from 'react-mixin';
import { auth, api }      from 'reach-react';
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
        label     : 'Email Address',
        component : 'input',
        type      : 'text',
        name      : 'identifier',
        className : 'col-xs-12 r-input r-input-center',
        tabIndex  : 1
      },
      {
        label     : 'Password',
        component : 'input',
        type      : 'password',
        name      : 'password',
        className : 'col-xs-12 r-input r-input-center',
        tabIndex  : 2
      }
    ];
  }

  /**
   * @method submit
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submit(data, reset) {
    api.post('/auth/login', data, function (error, user) {
      if (error) {
        reset();
        return snackbar.notify({
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
      auth.set(user);
      window.location = '/dashboard';
    }.bind(this));
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
          className = "r-form"
          fields    = { this.fields }
          submit    = { this.submit }
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