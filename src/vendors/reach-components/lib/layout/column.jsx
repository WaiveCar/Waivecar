'use strict';

import React from 'react';

export default class Column extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  /**
   * @method render
   */
  render() {
    let width = this.props.width || 12;
    let className = 'col-xs-' + width;
    if (this.props.className) {
      className = this.props.className + ' ' + className;
    }
    return (
      <div className={ className }>
        { this.props.children }
      </div>
    );
  }

}