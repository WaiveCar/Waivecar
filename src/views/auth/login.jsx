import React                 from 'react';
import mixin                 from 'react-mixin';
import { History, Link }     from 'react-router';
import config                from 'config';
import { auth, api, socket } from 'bento';
import { Form, snackbar }    from 'bento-web';

@mixin.decorate(History)
export default class LoginView extends React.Component {

  /**
   * Prepare the submit method.
   * @param  {...Mixed} args
   * @return {Void}
   */
  constructor(...args) {
    super(...args);
    this.submit = this.submit.bind(this);
  }

  /**
   * Submits a login request to the API.
   * @param  {Object}   data
   * @param  {Function} reset
   * @return {Void}
   */
  submit(data, reset) {
    let remember = this.refs.remember.checked;
    if (data.target) {
      data  = this.refs.form.data();
      reset = this.refs.form.reset;
    }
    api.post('/auth/login', data, (error, user) => {
      if (error) {
        reset();
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }

      // ### Store Credentials
      // Stores the user with the local store via the auth object.

      auth.set(user);

      // ### Authenticate Socket
      // Sends the user token for authentication with the socket.

      socket.authenticate(user.token);

      // ### Remember
      // Check if remember check was requested and send a remember request
      // back to the API.

      if (remember) {
        api.get('/auth/remember', (error) => {
          this.history.pushState(null, '/dashboard');
        }.bind(this));
      } else {
        this.history.pushState(null, '/dashboard');
      }
    }.bind(this));
  }

  /**
   * Render the login view to the client.
   * @return {Object}
   */
  render() {
    return (
      <div className="login">

        <div className="title">
          { config.app.name }&nbsp;
          <span className="title-site">Log in</span>
        </div>

        <Form
          ref       = "form"
          className = "r-form"
          fields    = {[
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
          ]}
          submit = { this.submit }
        />

        <div className="login-options clearfix">
          <label>
            <input type="checkbox" ref="remember" tabIndex="4" /> Remember me
          </label>
          <Link tabIndex="5" to="/reset-password">Forgot your password?</Link>
        </div>

        <div className="actions">
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>Log in</button>
          <a className="r-btn btn-facebook" href={ `https://www.facebook.com/dialog/oauth?client_id=${ config.auth.facebook.appId }&redirect_uri=${ config.auth.facebook.redirect }&state=login` }>
            <i className="fa fa-facebook" />
            Log in with Facebook
          </a>
        </div>

        <div className="footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    );
  }

}
