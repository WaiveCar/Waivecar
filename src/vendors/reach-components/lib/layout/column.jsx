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
    let className = (this.props.responsive ? 'col-lg-' : 'col-xs-') + width;
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