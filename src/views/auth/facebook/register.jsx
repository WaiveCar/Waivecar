'use strict';

import React         from 'react';
import mixin         from 'react-mixin';
import config        from 'config';
import { auth, api } from 'bento';
import facebook      from './index';
import Spinner       from './spinner';

class FacebookRegister extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      loading : true,
      error   : null
    };
  }

  /**
   * Send registration request to the API.
   * @return {Void}
   */
  componentDidMount() {
    facebook.setToken();
    facebook.register((error) => {
      this.setState({
        loading : false,
        error   : error.message
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

module.exports = FacebookRegister;
