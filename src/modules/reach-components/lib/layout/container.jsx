'use strict';

import React from 'react';

export default class Container extends React.Component {

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  /**
   * [renderSection description]
   * @param  {[type]} className [description]
   * @return {[type]}           [description]
   */
  renderSection(className) {
    return (
      <section id={ this.props.id } className={ className }>
        { this.props.children }
      </section>
    );
  }

  /**
   * [renderHeader description]
   * @param  {[type]} className [description]
   * @return {[type]}           [description]
   */
  renderHeader(className) {
    return (
      <header id={ this.props.id } className={ className }>
        { this.props.children }
      </header>
    );
  }

  /**
   * [renderFooter description]
   * @param  {[type]} className [description]
   * @return {[type]}           [description]
   */
  renderFooter(className) {
    return (
      <footer id={ this.props.id } className={ className }>
        { this.props.children }
      </footer>
    );
  }

  /**
   * [render description]
   * @return {[type]} [description]
   */
  render() {
    let className = this.props.isFluid ? 'container-fluid' : 'container';
    if (this.props.className) {
      className = this.props.className + ' ' + className;
    }

    switch (this.props.type) {
      case 'header' : return this.renderHeader(className);
      case 'footer' : return this.renderFooter(className);
      default       : return this.renderSection(className);
    }
  }
}