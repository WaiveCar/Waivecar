import React from 'react';

module.exports = class Hamburger extends React.Component {
  render() {
    return (
      <div className="hamburger-container">
        <div className={ this.props.button } onClick={ this.props.trigger }>
          <span>Toggle Menu</span>
        </div>
      </div>
    );
  }
}