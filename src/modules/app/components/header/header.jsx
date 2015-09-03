'use strict';

import React      from 'react';
import { Navbar } from 'reach-components';
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
        <div className="container">
          <Navbar menu={ this.state.menu } />
        </div>
      </header>
    );
  }

}