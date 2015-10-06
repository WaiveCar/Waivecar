'use strict';

import React from 'react';

export default class Row extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  /**
   * @method render
   */
  render() {
    let className = 'row';
    if (this.props.className) {
      className = this.props.className + ' ' + className;
    }
    return (
      <div id={ this.props.id } className={ className }>
        { this.props.children }
      </div>
    );
  }

}