import React  from 'react';
import config from 'config';

export default class Container extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      api : config.api.uri + (config.api.port ? ':' + config.api.port : '')
    }
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
  }

  getClassName() {
    let className = 'container-component';
    if (this.props.className) className = className + ' ' + this.props.className;
    if (this.props.fileId) className = className + ' ' + 'has-background';
    return className;
  }

  getStyle() {
    return this.props.height ? { height : this.props.height } : {}
  }

  /**
   * [renderSection description]
   * @return {[type]}           [description]
   */
  renderSection() {
    return (
      <section id={ this.props.id } className={ this.getClassName() }>
        { this.renderBackground() }
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
      <header id={ this.props.id } className={ this.getClassName() } style={ this.getStyle() }>
        { this.renderBackground() }
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
      <footer id={ this.props.id } className={ this.getClassName() }>
        { this.renderBackground() }
        <div className={ this.props.contentClassName }>
          { this.props.children }
        </div>
      </footer>
    );
  }

  renderBackground() {
    if (!this.props.fileId) return false;

    let data = `${ this.state.api }/file/${ this.props.fileId }`;
    return (
      <div className="container-background">
        <picture className="container-picture">
          <source media="(min-aspect-ratio: 1/1)" srcSet={ data } />
          <img src={ data } />
        </picture>
        <div className="background-overlay">
        </div>
      </div>
    );
  }

  /**
   * [render description]
   * @return {[type]} [description]
   */
  render() {
    switch (this.props.containerType) {
      case 'header' : return this.renderHeader();
      case 'footer' : return this.renderFooter();
      default       : return this.renderSection();
    }
  }
}