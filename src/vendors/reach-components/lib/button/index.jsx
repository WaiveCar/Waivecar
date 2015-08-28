'use strict';

import React from 'react';
import wave  from './wave';
import './style.scss';

export default class Button extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    wave(this.refs.button);
  }

  /**
   * @method render
   */
  render() {
    let className = this.props.className + ' btn-wave';
    return (
      <button type={ this.props.type || 'button' } className={ className } ref="button">
        { this.props.value }
      </button>
    );
  }

}