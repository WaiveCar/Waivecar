'use strict';

import React     from 'react';
import config    from 'config';
import Hamburger from 'components/hamburger';
import './style.scss';

export default class Header extends React.Component {
  render() {
    return (
      <header className="admin-header">
        <Hamburger button={ this.props.sidebar.button } trigger={ this.props.sidebar.toggle } />
        <a href="/#/" className="header-title">
          { config.app.name } Admin
        </a>
      </header>
    );
  }
}