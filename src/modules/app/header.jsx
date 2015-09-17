'use strict';

import React      from 'react';
import { Navbar } from 'reach-components';

export default class Header extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      menu : []
    };
  }

  render() {
    return (
      <header id="header">
        <Navbar menu={ this.state.menu } />
      </header>
    );
  }

}