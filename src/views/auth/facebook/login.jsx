'use strict';

import React         from 'react';
import mixin         from 'react-mixin';
import { History }   from 'react-router';
import config        from 'config';
import { auth, api } from 'bento';

@mixin.decorate(History)
class FacebookLogin extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading : true
    };
  }

  /**
   * Send login request to the api with the provided facebook code.
   * @return {Void}
   */
  componentDidMount() {
    api.post('/auth/facebook', {
      type        : 'login',
      code        : this.props.location.query.code,
      redirectUri : `${ config.auth.facebook.redirect }/login`
    }, (error, user) => {
      if (error) {
        this.setState({
          loading : false,
          error   : error.message
        });
      } else {
        auth.set(user);
        this.history.pushState(null, '/');
      }
    });
  }

  /**
   * Renders a loading spinner.
   * @return {Object}
   */
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

  /**
   * Renders result.
   * @return {[type]} [description]
   */
  result() {
    if (this.state.error) {
      return (
        <div>
          { this.state.error }
        </div>
      );
    }
    return this.spinner();
  }

  /**
   * Renders the component.
   * @return {Object}
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

};

module.exports = FacebookLogin;
