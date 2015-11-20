import React              from 'react';
import mixin              from 'react-mixin';
import { History, Link }  from 'react-router';
import config             from 'config';
import { auth, api, dom } from 'bento';
import { Form, snackbar } from 'bento-web';

@mixin.decorate(History)
class ResetPasswordView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('Reset Password');
    let token = null;
    if (this.props.location.query) {
      token = this.props.location.query.token;
    }
    this.state = {
      step  : token ? 3 : 1,
      token : token || null
    }
    this.requestToken = this.requestToken.bind(this);
    this.inputToken   = this.inputToken.bind(this);
    this.submit       = this.submit.bind(this);
  }

  step() {
    switch (this.state.step) {
      case 1 : return this.renderTokenRequest();
      case 2 : return this.renderTokenInput();
      case 3 : return this.renderPasswordForm();
      case 4 : return this.success();
    }
  }

  renderTokenRequest() {
    return (
      <div>
        <Form
          ref       = "requestTokenForm"
          className = "bento-form"
          fields    = {[
            {
              label     : 'Enter your email or phone',
              component : 'input',
              type      : 'text',
              name      : 'identifier',
              className : 'col-xs-12 bento-form-input bento-form-input-center',
              tabIndex  : 1
            }
          ]}
          submit = { this.requestToken }
        />
        <div className="token-request">
          <button type="button" className="r-btn btn-login" onClick={ this.requestToken }>Send reset token</button>
        </div>
      </div>
    );
  }

  requestToken(data, reset) {
    if (data.target) {
      data  = this.refs.requestTokenForm.data();
      reset = this.refs.requestTokenForm.reset;
    }
    api.post('/reset-password/token', {
      identifier : data.identifier,
      resetUrl   : `${ config.app.uri }${ config.app.port ? ':' + config.app.port : '' }/reset-password`
    }, (error, result) => {
      if (error) {
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      this.setState({
        step  : 2
      });
    }.bind(this));
  }

  renderTokenInput() {
    return (
      <div>
        <Form
          ref       = "tokenInputForm"
          className = "bento-form"
          fields    = {[
            {
              label     : 'Insert the reset token',
              component : 'input',
              type      : 'text',
              name      : 'token',
              className : 'col-xs-12 bento-form-input bento-form-input-center',
              tabIndex  : 1
            }
          ]}
          submit = { this.inputToken }
        />
        <div className="token-request">
          <button type="button" className="r-btn btn-login" onClick={ this.inputToken }>Submit token</button>
        </div>
      </div>
    );
  }

  inputToken(data, reset) {
    if (data.target) {
      data  = this.refs.tokenInputForm.data();
      reset = this.refs.tokenInputForm.reset;
    }
    this.setState({
      step  : 3,
      token : data.token
    });
  }

  renderPasswordForm() {
    return (
      <div>
        <Form
          ref       = "passwordForm"
          className = "bento-form"
          fields    = {[
            {
              label     : 'Enter your new password',
              component : 'input',
              type      : 'password',
              name      : 'password',
              className : 'col-xs-12 bento-form-input bento-form-input-center',
              tabIndex  : 1
            },
            {
              label     : 'Validate your new password',
              component : 'input',
              type      : 'password',
              name      : 'validate',
              className : 'col-xs-12 bento-form-input bento-form-input-center',
              tabIndex  : 2
            }
          ]}
          submit = { this.submit }
        />
        <div className="token-request">
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>Reset password</button>
        </div>
      </div>
    );
  }

  submit(data, reset) {
    if (data.target) {
      data  = this.refs.passwordForm.data();
      reset = this.refs.passwordForm.reset;
    }
    if (data.password !== data.validate) {
      return snackbar.notify({
        type    : 'danger',
        message : 'Your passwords does not match'
      });
    }
    api.put('/reset-password', {
      password : data.password,
      token    : this.state.token
    }, (error, result) => {
      if (error) {
        return snackbar.notify({
          type    : 'danger',
          message : error.message
        });
      }
      this.setState({
        step  : 4,
        token : null
      });
    });
  }

  success() {
    return (
      <div>
        <div className="message-success">
          Your password was successfully reset.
        </div>
        <div className="token-request">
          <Link to="/login" className="r-btn btn-login">Go to login</Link>
        </div>
      </div>
    );
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="login">
        <div className="title">
          { config.app.name }&nbsp;
          <span className="title-site">Reset Password</span>
        </div>
        {
          this.step()
        }
      </div>
    );
  }

}

module.exports = ResetPasswordView;