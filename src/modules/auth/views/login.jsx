import React     from 'react';
import Reach     from 'reach-react';
import config    from 'config';
import { Form }  from 'reach-components';

let { FormGroup } = Form;

export default class LoginView extends React.Component {

  /**
   * @class LoginView
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this._handleChange = this._handleChange.bind(this);
    this._handleLogin  = this._handleLogin.bind(this);
    this._handleError  = this._handleError.bind(this);
    this._resetError   = this._resetError.bind(this);
  }

  /**
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      error : {
        class : Reach.DOM.setClass({
          'error' : true,
          'show'  : false
        }),
        message : null
      },
      form  : {
        email    : null,
        password : null
      }
    });
  }

  /**
   * Handle the change event for form inputs.
   * @method _handleChange
   * @param  {Object} event
   */
  _handleChange(event) {
    let input = this.state.form;
    input[event.target.name] = event.target.value;
    this.setState({
      form : input
    });
  }

  /**
   * @method _handleLogin
   */
  _handleLogin(event) {
    let self = this;
    event.preventDefault();
    Reach.API.post('/auth/login', this.state.form, function (err, user) {
      if (err) {
        return self._handleError(err);
      }
      Reach.Auth.set(user);
      // TODO: needs to go to either Admin or App
      // depending upon what user is attempting to login to (and what they have access to)
      window.location = '#/admin/dashboard';
    });
  }

  /**
   * @method _handleError
   */
  _handleError(error) {
    this.setState({
      error : {
        class : Reach.DOM.setClass({
          'error' : true,
          'show'  : true
        }),
        message : error.message
      }
    });
    setTimeout(this._resetError, 5000);
  }

  /**
   * @method resetError
   */
  _resetError() {
    this.setState({
      error : {
        class : Reach.DOM.setClass({
          'error' : true,
          'show'  : false
        }),
        message : null
      }
    });
  }

  /**
   * @method render
   */
  render() {
    let fields = {
      email : {
        type         : 'text',
        name         : 'email',
        label        : 'Email Address',
        tabIndex     : "1",
        autoComplete : "off",
        required     : true
      },
      password : {
        type         : 'password',
        name         : 'password',
        label        : 'Password',
        tabIndex     : "2",
        autoComplete : "off",
        required     : true
      }
    };

    return (
      <div className="login">
        <i className="app-brand"></i>
        <div className="title">
          { config.app.name }
          <span className="title-site">&nbsp;Admin</span>
        </div>
        <form className="form reach-form" onSubmit={ this._handleLogin }>
          <FormGroup field={ fields.email }    onChange={ this._handleChange } />
          <FormGroup field={ fields.password } onChange={ this._handleChange } />
          <button type="submit" tabIndex="3" className="btn btn-block btn-primary">Login</button>
        </form>
        <div className={ this.state.error.class }>
          { this.state.error.message }
        </div>
        <div className="footer">
          Forgot your password? <a tabIndex="4" href="/#/reset-password">Reset</a>
        </div>
      </div>
    );
  }

}