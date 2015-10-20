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
   * @return {[type]}           [description]
   */
  renderSection() {
    return (
      <section id={ this.props.id } className={ this.props.className }>
        <div className={ this.props.contentClassName }>
        { this.props.children }
        </div>
      </section>
    );
  }

  /**
   * [renderHeader description]
   * @return {[type]}           [description]
   */
  renderHeader() {
    return (
      <header id={ this.props.id } className={ this.props.className }>
        <div className={ this.props.contentClassName }>
        { this.props.children }
        </div>
      </header>
    );
  }

  /**
   * [renderFooter description]
   * @return {[type]}           [description]
   */
  renderFooter() {
    return (
      <footer id={ this.props.id } className={ this.props.className }>
        <div className={ this.props.contentClassName }>
          { this.props.children }
        </div>
      </footer>
    );
  }

  /**
   * [render description]
   * @return {[type]} [description]
   */
  render() {
    switch (this.props.type) {
      case 'header' : return this.renderHeader();
      case 'footer' : return this.renderFooter();
      default       : return this.renderSection();
    }
  }
}