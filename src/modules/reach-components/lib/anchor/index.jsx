'use strict';

import React from 'react';
import Dom   from 'react-dom';

export default class Anchor extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  /**
   * @method onClick
   */
  onClick(event) {
    if (event.target.href) {
      event.preventDefault();
      let locationPosition = event.target.href.indexOf('#') + 1;
      let element = document.getElementById(event.target.href.substring(locationPosition));
      if (element) {
        element.scrollIntoView(true);
      }
    }
  }

  /**
   * @method render
   */
  render() {
    let className = this.props.className;
    return (
      <a className={ className } href={ this.props.href } onClick={ this.onClick }>
        { this.props.children }
      </a>
    );
  }
}