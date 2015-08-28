'use strict';

import React from 'react';
import './style.scss';

export default class Hamburger extends React.Component {
  render() {
    return (
      <div className={ this.props.button } onClick={ this.props.trigger }>
        <span>Toggle Menu</span>
      </div>
    );
  }
}