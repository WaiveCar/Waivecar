import React    from 'react';
import Reach    from 'reach-react';
import config   from 'config';
import { Form } from 'reach-components';
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

    this._handleSuccess = this._handleSuccess.bind(this);
    this._handleError   = this._handleError.bind(this);
  }

  /**
   * Handle the change event for form inputs.
   * @method _handleChange
   * @param  {Object} event
   *
  _handleChange(event) {
    let input = this.state.form;
    input[event.target.name] = event.target.value;
    this.setState({
      form : input
    });
  }

  /**
   * @method _handleLogin
   *
  _handleLogin(event) {
    let self = this;
    event.preventDefault();
    Reach.API.post('/auth/login', this.state.form, function (err, user) {
      if (err) {
        return self._handleError(err);
      }
      Reach.Auth.set(user);
      // TODO: needs to go to either /admin or /app
      // depending upon what user is attempting to login to (and what they have access to)
      window.location = '#/admin';
    });
  }
  */

  /**
   * @method _handleSuccess
   * @param  {Object} user
   */
  _handleSuccess(user) {
    Reach.Auth.set(user);
    // TODO: needs to go to either /admin or /app
    // depending upon what user is attempting to login to (and what they have access to)
    window.location = '#/admin';
  }

  /**
   * @method _handleError
   */
  _handleError(error) {
    alert(error.message);
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
          onSuccess = { this._handleSuccess } 
          onError   = { this._handleError }
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

/*
<form className="form reach-form" onSubmit={ this._handleLogin }>
  <FormGroup field={ fields.email }    onChange={ this._handleChange } />
  <FormGroup field={ fields.password } onChange={ this._handleChange } />
  <button type="submit" tabIndex="3" className="btn btn-block btn-primary">Login</button>
</form>
*/