'use strict';

import React         from 'react';
import mixin         from 'react-mixin';
import config        from 'config';
import { auth, api } from 'bento';
import facebook      from './index';
import Spinner       from './spinner';

class FacebookLogin extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading : true,
      error   : null
    };
  }

  /**
   * Send login request to the api with the provided facebook code.
   * @return {Void}
   */
  componentDidMount() {
    facebook.setToken();
    facebook.login((err) => {
      this.setState({
        loading : false,
        error   : err.message
      });
    });
  }

  /**
   * Renders result.
   * @return {[type]} [description]
   */
  result() {
    if (this.state.error) {
      return (
        <div className="result">
          <img src="/images/logo.svg" />
          { this.state.error }
          <div className="result-actions">
            Create an account? <Link to="/register">Register</Link>
          </div>
        </div>
      );
    }
    return <Spinner />;
  }

  /**
   * Renders the component.
   * @return {Object}
   */
  render() {
    return (
      <div>
        {
          this.state.loading ? <Spinner /> : this.result()
        }
      </div>
    );
  }

};

module.exports = FacebookLogin;
