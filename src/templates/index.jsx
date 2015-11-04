'use strict';

import React        from 'react';
import { Link }     from 'react-router';
import { snackbar } from 'bento-web';

module.exports = class App extends React.Component {

  constructor(...args) {
    super(...args);
  }

  /**
   * Remove the snackbar when the router changes views.
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Void}
   */
  componentWillReceiveProps(nextProps, nextState) {
    let prev = this.props.location.pathname;
    let next = nextProps.location.pathname;
    if (prev !== next) {
      snackbar.dismiss();
    }
  }

  /**
   * Render the root application.
   * @method render
   */
  render() {
    return (
      <div id="main">
        { this.props.children }
        { snackbar.render() }
      </div>
    );
  }

}