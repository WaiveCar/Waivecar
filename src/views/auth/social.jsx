'use strict';

import React          from 'react';
import mixin          from 'react-mixin';
import { auth, api }  from 'reach-react';
import { History } from 'react-router';
import { snackbar }   from 'reach-components';
import config         from 'config';

@mixin.decorate(History)

export default class Social extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading : true
    }
  }

  /**
   * Attempts to sign in with the provided facebook details or redirects
   * back to login with an error.
   * @return {Void}
   */
  componentDidMount() {
    let { code, state } = this.props.location.query;
    if (code) {
      switch (state) {
        case 'register' : return this.register(code);
        case 'connect'  : return this.connect(code);
        case 'login'    : return this.login(code);
      }
    }
  }

  register(code) {
    api.post('/auth/facebook', {
      type        : 'register',
      code        : code,
      redirectUri : config.auth.facebook.redirect
    }, (error, user) => {
      if (error) {
        this.setState({
          loading : false
        });
        return snackbar.notify({
          type    : 'danger',
          message : error.message,
          persist : true,
          action  : {
            title : 'Back to login',
            click : () => {
              this.history.pushState(null, '/login');
            }.bind(this)
          }
        });
      }
      auth.set(user);
      this.history.pushState(null, '/dashboard');
    }.bind(this));
  }

  connect(code) {
    api.post('/auth/facebook', {
      type        : 'connect',
      code        : code,
      redirectUri : config.auth.facebook.redirect
    }, (error, result) => {
      if (error) {
        this.setState({
          loading : false
        });
        return snackbar.notify({
          type    : 'danger',
          message : error.message,
          persist : true,
          action  : {
            title : 'Back to login',
            click : () => {
              this.history.pushState(null, '/login');
            }.bind(this)
          }
        });
      }
      console.log(result);
    });
  }

  login(code) {
    api.post('/auth/facebook', {
      type        : 'login',
      code        : code,
      redirectUri : config.auth.facebook.redirect
    }, (error, user) => {
      if (error) {
        this.setState({
          loading : false
        });
        return snackbar.notify({
          type    : 'danger',
          message : error.message,
          persist : true,
          action  : {
            title : 'Back to login',
            click : () => {
              this.history.pushState(null, '/login');
            }.bind(this)
          }
        });
      }
      auth.set(user);
      this.history.pushState(null, '/dashboard');
    }.bind(this));
  }

  spinner() {
    return (
      <div className="sk-cube-grid">
        <div className="sk-cube sk-cube1"></div>
        <div className="sk-cube sk-cube2"></div>
        <div className="sk-cube sk-cube3"></div>
        <div className="sk-cube sk-cube4"></div>
        <div className="sk-cube sk-cube5"></div>
        <div className="sk-cube sk-cube6"></div>
        <div className="sk-cube sk-cube7"></div>
        <div className="sk-cube sk-cube8"></div>
        <div className="sk-cube sk-cube9"></div>
      </div>
    );
  }

  result() {
    let { state } = this.props.location.query;
    switch (state) {
      case 'register' : state = 'Registration'; break;
      case 'connect'  : state = 'Connection'; break;
      case 'login'    : state = 'Login'; break;
    }
    return (
      <div className="result animated fadeInDown">
        <img src="/images/logo.svg" />
        { state  } Failed<br />
        <small>The current social connector operation failed, check the error for more details.</small>
      </div>
    )
  }

  /**
   * This is a null component that only does computation.
   * @return {Null}
   */
  render() {
    return (
      <div>
        {
          this.state.loading ? this.spinner() : this.result()
        }
      </div>
    );
  }

}