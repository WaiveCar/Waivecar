'use strict';

import React      from 'react';
import { Hamburger, Navbar } from 'reach-components';
import UI         from '../../ui';
import './style.scss';

export default class Header extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      menu : [
        {
          name     : 'Admin',
          children : UI.menu.sidebar
        }
      ]
    };
  }

  render() {
    return (
      <header className="nav-header">
        <Hamburger button={ this.props.sidebar.button } trigger={ this.props.sidebar.toggle } />
        <div className="container">
          <Navbar menu={ this.state.menu } />
        </div>
      </header>
    );
  }

}