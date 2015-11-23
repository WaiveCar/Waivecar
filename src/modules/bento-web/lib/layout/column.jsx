import React from 'react';

module.exports = class Column extends React.Component {

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
    let prefix = this.props.responsiveBreakpoint ? `col-${ this.props.responsiveBreakpoint }-` : 'col-md-';
    let className = (this.props.responsive ? prefix : 'col-xs-') + width;
    if (this.props.centerContent) {
      className = `${ className } m-x-auto`;
    }
    if (this.props.className) {
      className = `${ this.props.className } ${ className }`;
    }
    return (
      <div id={ this.props.id } className={ className }>
        { this.props.children }
      </div>
    );
  }

}
