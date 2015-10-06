'use strict';

import React from 'react';

export default class Container extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  /**
   * @method render
   */
  render() {
    let className = this.props.isFluid ? 'container-fluid' : 'container';
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