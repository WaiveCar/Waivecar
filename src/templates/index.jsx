'use strict';

import React        from 'react';
import { snackbar } from 'reach-components';
import { Link }     from 'react-router';

export default class App extends React.Component {

  /**
   * @constrcutor
   */
  constructor(...args) {
    super(...args);
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