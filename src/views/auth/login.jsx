'use strict';

import React                from 'react';
import mixin                from 'react-mixin';
import { auth, api }        from 'reach-react';
import { Navigation, Link } from 'react-router';
import config               from 'config';
import { Form, snackbar }   from 'reach-components';

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
    this.submit = this.submit.bind(this);
  }

  /**
   * @method submit
   * @param  {Object}   data
   * @param  {Function} reset
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
      auth.set(user);
      if (remember) {
        api.get('/auth/remember', (error) => {
          this.transitionTo('/dashboard');
        }.bind(this));
      } else {
        this.transitionTo('/dashboard');
      }
    }.bind(this));
  }

  /**
   * @method render
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
          fields    = { this.fields }
          submit    = { this.submit }
        />

        <div className="login-options clearfix">
          <label>
            <input type="checkbox" ref="remember" tabIndex="4" /> Remember me
          </label>
          <Link tabIndex="5" to="/reset-password">Forgot your password?</Link>
        </div>

        <div className="actions">
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>Log in</button>
          <a className="r-btn btn-facebook" href="https://www.facebook.com/dialog/oauth?client_id=783941098370564&redirect_uri=http://local.io:8080/auth/facebook&state=login">
            <i className="fa fa-facebook" />
            Log in with Facebook
          </a>
        </div>

        <div className="footer">
          Don't have a WaiveCar account? <Link to="/register">Register</Link>
        </div>
      </div>
    );
  }

}