'use strict';

import React from 'react';

export default class ErrorLayout extends React.Component {

  render() {
    return (
      <div id="error">
        { this.props.children }
      </div>
    );
  }

}