'use strict';

import React    from 'react';
import facebook from './index';
import Spinner  from './spinner';

class FacebookConnect extends React.Component {

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
    facebook.connect((err) => {
      this.setState({
        loading : false,
        error   : err.message
      });
    });
  }

  /**
   * Renders result.
   * @return {Void} [description]
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
    return <div>{ this.state.loading ? <Spinner /> : this.result() }</div>;
  }

};

module.exports = FacebookConnect;
