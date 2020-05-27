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

    this.state = {
      iswork: this.props.location.query.iswork,
      isnew: this.props.location.query.isnew,
      admin: this.props.location.query.admin,
      hash: this.props.location.query.hash,
      changing: false,
    };
    this.state.step = this.state.hash ? 3 : 1;
    this.state.verb = this.state.isnew ? 'Set' : 'Reset';
    this.state.adjective = this.state.isnew ? '' : 'new';

    dom.setTitle([this.state.verb, this.state.adjective, 'Password'].join(' '));

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
              label     : 'Enter your email',
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
    this.setState({identifier: data.identifier});
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
        step  : 2,
        changing: true,
      }, () => this.setState({changing: false}));
    });
  }

  renderTokenInput() {
    return (
      <div>
        <Form
          ref       = "tokenInputForm"
          className = "bento-form-static"
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
          className = "bento-form-static"
          fields    = {[
            {
              label     : `Enter your ${ this.state.adjective } password`,
              component : 'input',
              type      : 'password',
              name      : 'password',
              className : 'col-xs-12 bento-form-input bento-form-input-center',
              tabIndex  : 1
            },
            {
              label     : `Validate your ${ this.state.adjective } password`,
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
          <button type="button" className="r-btn btn-login" onClick={ this.submit }>{ this.state.verb } password</button>
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
    // there's essentially two ways we can enter this page
    // the first is with a hash provided, that we can just
    // pass over and the second is with a token/email pair
    api.put('/reset-password', {
      password   : data.password,
      identifier : this.state.identifier,
      token      : this.state.token,
      hash       : this.state.hash,  
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
          { this.state.isnew && !this.state.iswork?
              "Welcome to WaiveCar! The next step is to download the app and setup your account." :
              "Your password was successfully reset."
          }
        </div>
        { this.state.isnew && !this.state.iswork && 
            <p>
              <a href="https://itunes.apple.com/us/app/waivecar/id1051144802?ls=1&mt=8">
                <img style={{ width: '50%', padding: '0 2%' }} src="https://lb.waivecar.com/images/site/btn-app-store.svg" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.waivecardrive.app">
                <img style={{ width: '50%', padding: '0 2%' }} src="https://lb.waivecar.com/images/site/btn-google-play.svg" />
              </a>
            </p>
        }
        {this.state.iswork && 
            <div className="message-success">
              You are now ready to use Waive! Please login and setup your account{' '} 
              <a href={this.state.admin ? 'https://lb.waivecar.com/login?new=true' : 'https://waivework.com/login'}>here</a>.
            </div>
        }
        { !this.state.isnew && 
            <div className="token-request">
              <Link to="/login" className="r-btn btn-login">Go login</Link>
            </div>
        }
      </div>
    );
  }

  render() {
    let {changing} = this.state;
    return (
      <div className="login">
        <div className="title">
          Waive&nbsp;
          <span className="title-site">{ this.state.verb } Password</span>
        </div>
        {
          !changing && this.step()
        }
      </div>
    );
  }

}

module.exports = ResetPasswordView;
