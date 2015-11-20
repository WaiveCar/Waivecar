import React              from 'react';
import mixin              from 'react-mixin';
import { History, Link }  from 'react-router';
import config             from 'config';
import { auth, api, dom } from 'bento';
import { Form, snackbar } from 'bento-web';

@mixin.decorate(History)
class RegisterView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('Register');
    this.fields = [
      {
        label     : 'First name',
        component : 'input',
        type      : 'text',
        name      : 'firstName',
        className : 'col-xs-12 bento-form-input bento-form-input-center',
        tabIndex  : 1
      },
      {
        label     : 'Last name',
        component : 'input',
        type      : 'text',
        name      : 'lastName',
        className : 'col-xs-12 bento-form-input bento-form-input-center',
        tabIndex  : 2
      },
      {
        label     : 'Email address',
        component : 'input',
        type      : 'text',
        name      : 'email',
        className : 'col-xs-12 bento-form-input bento-form-input-center',
        tabIndex  : 3
      },
      {
        label     : 'Phone number',
        component : 'input',
        type      : 'string',
        name      : 'phone',
        className : 'col-xs-12 bento-form-input bento-form-input-center',
        tabIndex  : 4
      },
      {
        label     : 'Password',
        component : 'input',
        type      : 'password',
        name      : 'password',
        className : 'col-xs-12 bento-form-input bento-form-input-center',
        tabIndex  : 5
      }
    ];
    this.submit = this.submit.bind(this);
  }

  /**
   * Submits the registration data to the API.
   * @param  {Object}   data  The user data to be submitted.
   * @param  {Function} reset Empties the form.
   * @return {Void}
   */
  submit(data, reset) {
    if (data.target) {
      data  = this.refs.form.data();
      reset = this.refs.form.reset;
    }
    api.post('/users', data, (error, user) => {
      if (error) {
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      this.login(data.email, data.password);
    }.bind(this));
  }

  /**
   * After a successfull registration attempt we sign the user into the system.
   * @param  {String} email
   * @param  {String} password
   * @return {Void}
   */
  login(email, password) {
    api.post('/auth/login', {
      identifier : email,
      password   : password
    }, (error, user) => {
      if (error) {
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      auth.set(user);
      this.history.pushState(null, '/dashboard');
    }.bind(this));
  }

  /**
   * Render the registration component.
   * @return {Object}
   */
  render() {
    return (
      <div className="login">

        <div className="title">
          { config.app.name }&nbsp;
          <span className="title-site">Register</span>
        </div>

        <Form
          ref       = "form"
          className = "bento-form"
          fields    = { this.fields }
          submit    = { this.submit }
        />

        <div className="actions">
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>Register</button>
          <a className="r-btn btn-facebook" href={ `https://www.facebook.com/dialog/oauth?client_id=${ config.auth.facebook.appId }&redirect_uri=${ config.auth.facebook.redirect }&state=register` }>
            <i className="fa fa-facebook" />
            Register with Facebook
          </a>
        </div>

        <div className="footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    );
  }

}

module.exports = RegisterView;