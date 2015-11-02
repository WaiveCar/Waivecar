import React from 'react';
import wave  from './wave';

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
    let { type, onClick, className, style } = this.props;
    return (
      <button type={ type || 'button' } onClick={ onClick || null } className={ className + ' btn-wave' } style={ style || null } ref="button">
        { this.props.value }
      </button>
    );
  }

}