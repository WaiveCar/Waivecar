import React              from 'react';
import mixin              from 'react-mixin';
import { History, Link }  from 'react-router';
import config             from 'config';
import { auth, api, dom } from 'bento';
import { Form, snackbar } from 'bento-web';
import facebook           from './facebook';

@mixin.decorate(History)
class RegisterView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('Register');
    this.fields = require('./fields/register');
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
    });
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
      this.history.pushState(null, '/');
    });
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
          <button className="r-btn btn-facebook" onClick={ facebook.register }>
            <i className="fa fa-facebook" />
            Register with Facebook
          </button>
        </div>

        <div className="footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    );
  }

}

module.exports = RegisterView;
